import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as QRCode from 'qrcode';
import { PaymentLink, PaymentLinkStatus, PaymentLinkType } from './entities/payment-link.entity';
import { Settlement, SettlementStatus, SettlementType } from './entities/settlement.entity';
import { QrPayment, QrStatus } from './entities/qr-payment.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from '../wallet/entities/wallet-transaction.entity';
import { User } from '../users/entities/user.entity';

// ============================================================
// CONFIGURACIÓN DE PAGO SIMPLE
// ============================================================
export const PAGO_SIMPLE_CONFIG = {
  PLATFORM_FEE_PCT: 3.5,           // 3.5% comisión de plataforma
  SETTLEMENT_DAYS: 2,              // T+2 días hábiles
  MAX_INSTALLMENTS: 12,            // Máximo cuotas
  QR_EXPIRY_MINUTES: 30,           // QR expira en 30 min
  LINK_EXPIRY_DAYS: 30,            // Links expiran en 30 días
  INSTALLMENT_PLANS: [
    { qty: 1,  surcharge: 0,     label: 'Pago en 1 cuota', minAmount: 0 },
    { qty: 3,  surcharge: 0,     label: '3 cuotas sin interés', minAmount: 3000 },
    { qty: 6,  surcharge: 0.15,  label: '6 cuotas con 15% interés', minAmount: 5000 },
    { qty: 9,  surcharge: 0.25,  label: '9 cuotas con 25% interés', minAmount: 10000 },
    { qty: 12, surcharge: 0.35,  label: '12 cuotas con 35% interés', minAmount: 15000 },
  ],
};

function generateCode(prefix = 'PS'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix + '-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

@Injectable()
export class PagoSimpleService {
  constructor(
    @InjectRepository(PaymentLink)
    private linkRepo: Repository<PaymentLink>,
    @InjectRepository(Settlement)
    private settlementRepo: Repository<Settlement>,
    @InjectRepository(QrPayment)
    private qrRepo: Repository<QrPayment>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private txRepo: Repository<WalletTransaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // ============================================================
  // PLANES DE CUOTAS
  // ============================================================
  getInstallmentPlans(amount: number) {
    return PAGO_SIMPLE_CONFIG.INSTALLMENT_PLANS
      .filter(p => amount >= p.minAmount)
      .map(p => ({
        ...p,
        totalAmount: Math.round(amount * (1 + p.surcharge) * 100) / 100,
        installmentAmount: Math.round((amount * (1 + p.surcharge) / p.qty) * 100) / 100,
      }));
  }

  // ============================================================
  // PAYMENT LINKS
  // ============================================================
  async createPaymentLink(userId: string, dto: {
    title: string;
    description?: string;
    amount: number;
    type?: PaymentLinkType;
    maxInstallments?: number;
    reference?: string;
    expiresInDays?: number;
  }) {
    const code = generateCode('PS');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dto.expiresInDays || PAGO_SIMPLE_CONFIG.LINK_EXPIRY_DAYS));

    const link = this.linkRepo.create({
      code,
      creatorId: userId,
      title: dto.title,
      description: dto.description,
      amount: dto.amount,
      type: dto.type || PaymentLinkType.SINGLE,
      maxInstallments: dto.maxInstallments || 1,
      reference: dto.reference,
      expiresAt,
      status: PaymentLinkStatus.ACTIVE,
    });

    await this.linkRepo.save(link);
    return { ...link, payUrl: `/pago-simple/pagar/${code}` };
  }

  async getPaymentLink(code: string) {
    const link = await this.linkRepo.findOne({
      where: { code },
      relations: ['creator'],
    });
    if (!link) throw new NotFoundException('Link de pago no encontrado');
    if (link.status === PaymentLinkStatus.EXPIRED || (link.expiresAt && new Date() > link.expiresAt)) {
      if (link.status === PaymentLinkStatus.ACTIVE) {
        await this.linkRepo.update({ id: link.id }, { status: PaymentLinkStatus.EXPIRED });
        link.status = PaymentLinkStatus.EXPIRED;
      }
    }

    // Increment view count
    await this.linkRepo.increment({ id: link.id }, 'viewCount', 1);

    return {
      id: link.id,
      code: link.code,
      title: link.title,
      description: link.description,
      amount: Number(link.amount),
      currency: link.currency,
      status: link.status,
      type: link.type,
      creator: { name: link.creator?.name, id: link.creator?.id },
      expiresAt: link.expiresAt,
      maxInstallments: link.maxInstallments,
      installmentPlans: this.getInstallmentPlans(Number(link.amount)),
    };
  }

  async processPaymentLink(payerId: string, code: string, installments = 1) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const link = await this.linkRepo.findOne({ where: { code }, relations: ['creator'] });
      if (!link) throw new NotFoundException('Link no encontrado');
      if (link.status !== PaymentLinkStatus.ACTIVE) throw new BadRequestException('Este link ya fue utilizado o expiró');
      if (link.expiresAt && new Date() > link.expiresAt) throw new BadRequestException('El link de pago expiró');
      if (link.creatorId === payerId) throw new BadRequestException('No podés pagar tu propio link');

      const plan = PAGO_SIMPLE_CONFIG.INSTALLMENT_PLANS.find(p => p.qty === installments);
      const totalAmount = plan ? Number(link.amount) * (1 + plan.surcharge) : Number(link.amount);
      const roundedTotal = Math.round(totalAmount * 100) / 100;

      // Debit from payer wallet
      const payerWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: payerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payerWallet) throw new NotFoundException('Billetera del pagador no encontrada');
      if (payerWallet.isFrozen) throw new ForbiddenException('Tu billetera está congelada');
      if (Number(payerWallet.balance) < roundedTotal) {
        throw new BadRequestException(`Saldo insuficiente. Disponible: $${Number(payerWallet.balance).toFixed(2)}, requerido: $${roundedTotal.toFixed(2)}`);
      }

      const payerNewBalance = Math.round((Number(payerWallet.balance) - roundedTotal) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: payerWallet.id }, { balance: payerNewBalance });

      // Debit TX for payer
      const payerTx = new WalletTransaction();
      payerTx.walletId = payerWallet.id;
      payerTx.type = WalletTransactionType.PAYMENT;
      payerTx.amount = roundedTotal;
      payerTx.balanceAfter = payerNewBalance;
      payerTx.description = `Pago: ${link.title} (${installments > 1 ? `${installments} cuotas` : '1 cuota'})`;
      payerTx.referenceId = link.id;
      payerTx.referenceType = 'payment_link';
      payerTx.status = WalletTransactionStatus.COMPLETED;
      await queryRunner.manager.save(payerTx);

      // Calculate fee and net for seller
      const feeAmount = Math.round(roundedTotal * (PAGO_SIMPLE_CONFIG.PLATFORM_FEE_PCT / 100) * 100) / 100;
      const netAmount = Math.round((roundedTotal - feeAmount) * 100) / 100;

      // Credit seller wallet
      let sellerWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: link.creatorId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!sellerWallet) {
        sellerWallet = queryRunner.manager.create(Wallet, { userId: link.creatorId, balance: 0 });
        sellerWallet = await queryRunner.manager.save(sellerWallet);
      }

      const sellerNewBalance = Math.round((Number(sellerWallet.balance) + netAmount) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: sellerWallet.id }, { balance: sellerNewBalance });

      const sellerTx = new WalletTransaction();
      sellerTx.walletId = sellerWallet.id;
      sellerTx.type = WalletTransactionType.TRANSFER_IN;
      sellerTx.amount = netAmount;
      sellerTx.balanceAfter = sellerNewBalance;
      sellerTx.description = `Cobro por link: ${link.title} (neto, -${PAGO_SIMPLE_CONFIG.PLATFORM_FEE_PCT}% fee)`;
      sellerTx.referenceId = link.id;
      sellerTx.referenceType = 'payment_link';
      sellerTx.status = WalletTransactionStatus.COMPLETED;
      await queryRunner.manager.save(sellerTx);

      // Update link status
      if (link.type === PaymentLinkType.SINGLE) {
        await queryRunner.manager.update(PaymentLink, { id: link.id }, {
          status: PaymentLinkStatus.PAID,
          payerId,
          paidAt: new Date(),
        });
      }

      await queryRunner.commitTransaction();

      // Create settlement record
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + PAGO_SIMPLE_CONFIG.SETTLEMENT_DAYS);

      await this.settlementRepo.save(this.settlementRepo.create({
        sellerId: link.creatorId,
        paymentLinkId: link.id,
        type: SettlementType.SALE,
        status: SettlementStatus.SETTLED,
        grossAmount: roundedTotal,
        feeAmount,
        netAmount,
        settledAt: new Date(),
        scheduledFor,
        description: `Pago por link: ${link.title}`,
      }));

      return {
        success: true,
        message: `Pago de $${roundedTotal.toFixed(2)} procesado correctamente`,
        transactionId: payerTx.id,
        amount: roundedTotal,
        installments,
        newBalance: payerNewBalance,
        receipt: {
          paymentLinkId: link.id,
          title: link.title,
          amount: roundedTotal,
          fee: feeAmount,
          net: netAmount,
          installments,
          date: new Date().toISOString(),
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyPaymentLinks(userId: string, page = 1, limit = 20) {
    const [links, total] = await this.linkRepo.findAndCount({
      where: { creatorId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { links: links.map(l => ({ ...l, payUrl: `/pago-simple/pagar/${l.code}` })), total, page };
  }

  async cancelPaymentLink(userId: string, linkId: string) {
    const link = await this.linkRepo.findOne({ where: { id: linkId, creatorId: userId } });
    if (!link) throw new NotFoundException('Link no encontrado');
    if (link.status === PaymentLinkStatus.PAID) throw new BadRequestException('No podés cancelar un link ya pagado');
    await this.linkRepo.update({ id: linkId }, { status: PaymentLinkStatus.CANCELLED });
    return { message: 'Link cancelado' };
  }

  // ============================================================
  // QR CODES
  // ============================================================
  async generateQR(userId: string, dto: {
    amount?: number;
    description?: string;
    businessName?: string;
    cuit?: string;
    branchName?: string;
    address?: string;
    qrType?: string;
    productName?: string;
  }) {
    const { amount, description, businessName, cuit, branchName, address, qrType, productName } = dto;
    const qrCode = generateCode('QR');

    // Permanent types: comercio, caja, sucursal — no expiry
    const permanentTypes = ['comercio', 'caja', 'sucursal'];
    const isPermanent = permanentTypes.includes(qrType || 'comercio');

    let expiresAt: Date | null = null;
    if (!isPermanent) {
      expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + PAGO_SIMPLE_CONFIG.QR_EXPIRY_MINUTES);
    }

    const payUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago-simple/qr/${qrCode}`;

    // Embed richer data in the QR
    const qrData = JSON.stringify({
      type: 'pago-simple-qr',
      code: qrCode,
      amount: amount || null,
      businessName: businessName || null,
      cuit: cuit || null,
      branchName: branchName || null,
      qrType: qrType || 'comercio',
      payUrl,
    });

    const qrImageBase64 = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#1E293B', light: '#FFFFFF' },
      errorCorrectionLevel: 'H', // High error correction for better readability
    });

    const qrPayment = this.qrRepo.create({
      ownerId: userId,
      qrCode,
      amount: amount || null,
      description,
      businessName,
      cuit,
      branchName,
      address,
      qrType: (qrType as any) || 'comercio',
      productName,
      isPermanent,
      qrImageBase64,
      expiresAt,
      status: QrStatus.ACTIVE,
      scanCount: 0,
      paymentCount: 0,
      totalCollected: 0,
    });

    await this.qrRepo.save(qrPayment);

    return {
      id: qrPayment.id,
      qrCode,
      qrImageBase64,
      expiresAt,
      isPermanent,
      payUrl,
      businessName,
      cuit,
      branchName,
      address,
      qrType: qrPayment.qrType,
      description,
      productName,
      amount,
    };
  }

  async getMyQRs(userId: string) {
    const qrs = await this.qrRepo.find({
      where: { ownerId: userId, status: QrStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    // Auto-expire non-permanent expired QRs
    const now = new Date();
    const result = await Promise.all(qrs.map(async (qr) => {
      if (!qr.isPermanent && qr.expiresAt && now > qr.expiresAt && qr.status === QrStatus.ACTIVE) {
        await this.qrRepo.update({ id: qr.id }, { status: QrStatus.EXPIRED });
        qr.status = QrStatus.EXPIRED;
      }
      return {
        id: qr.id,
        qrCode: qr.qrCode,
        qrImageBase64: qr.qrImageBase64,
        amount: qr.amount ? Number(qr.amount) : null,
        description: qr.description,
        businessName: qr.businessName,
        cuit: qr.cuit,
        branchName: qr.branchName,
        address: qr.address,
        qrType: qr.qrType,
        productName: qr.productName,
        isPermanent: qr.isPermanent,
        status: qr.status,
        expiresAt: qr.expiresAt,
        createdAt: qr.createdAt,
        scanCount: qr.scanCount || 0,
        paymentCount: qr.paymentCount || 0,
        totalCollected: qr.totalCollected ? Number(qr.totalCollected) : 0,
        payUrl: `/pago-simple/qr/${qr.qrCode}`,
      };
    }));
    return { qrs: result.filter(q => q.status === QrStatus.ACTIVE), total: result.filter(q => q.status === QrStatus.ACTIVE).length };
  }

  async deleteQR(userId: string, qrId: string) {
    const qr = await this.qrRepo.findOne({ where: { id: qrId } });
    if (!qr) throw new NotFoundException('QR no encontrado');
    if (qr.ownerId !== userId) throw new ForbiddenException('No tenés permiso para eliminar este QR');
    await this.qrRepo.update({ id: qrId }, { status: QrStatus.DELETED });
    return { success: true, message: 'QR eliminado correctamente' };
  }

  async getQR(qrCode: string) {
    const qr = await this.qrRepo.findOne({ where: { qrCode }, relations: ['owner'] });
    if (!qr) throw new NotFoundException('QR no encontrado');
    if (!qr.isPermanent && qr.expiresAt && new Date() > qr.expiresAt && qr.status === QrStatus.ACTIVE) {
      await this.qrRepo.update({ id: qr.id }, { status: QrStatus.EXPIRED });
      qr.status = QrStatus.EXPIRED;
    }
    // Increment scan count
    if (qr.status === QrStatus.ACTIVE) {
      await this.qrRepo.update({ id: qr.id }, { scanCount: (qr.scanCount || 0) + 1 });
    }
    return {
      qrCode: qr.qrCode,
      qrImageBase64: qr.qrImageBase64,
      amount: qr.amount ? Number(qr.amount) : null,
      description: qr.description,
      businessName: qr.businessName,
      cuit: qr.cuit,
      branchName: qr.branchName,
      address: qr.address,
      qrType: qr.qrType,
      productName: qr.productName,
      isPermanent: qr.isPermanent,
      owner: { name: qr.owner?.name, id: qr.owner?.id },
      status: qr.status,
      expiresAt: qr.expiresAt,
      scanCount: (qr.scanCount || 0) + 1,
    };
  }

  async payQR(payerId: string, qrCode: string, amount: number) {
    const qr = await this.qrRepo.findOne({ where: { qrCode } });
    if (!qr) throw new NotFoundException('QR no encontrado');
    if (qr.status !== QrStatus.ACTIVE) throw new BadRequestException('Este QR ya fue utilizado o expiró');
    if (qr.expiresAt && new Date() > qr.expiresAt) throw new BadRequestException('El QR expiró');
    if (qr.ownerId === payerId) throw new BadRequestException('No podés pagarte a vos mismo');

    const finalAmount = qr.amount ? Number(qr.amount) : amount;
    if (!finalAmount || finalAmount <= 0) throw new BadRequestException('Monto inválido');

    // Process as payment link style
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payerWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: payerId }, lock: { mode: 'pessimistic_write' }
      });
      if (!payerWallet || Number(payerWallet.balance) < finalAmount) {
        throw new BadRequestException('Saldo insuficiente');
      }

      const payerNewBalance = Math.round((Number(payerWallet.balance) - finalAmount) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: payerWallet.id }, { balance: payerNewBalance });

      let ownerWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: qr.ownerId }, lock: { mode: 'pessimistic_write' }
      });
      if (!ownerWallet) {
        ownerWallet = queryRunner.manager.create(Wallet, { userId: qr.ownerId, balance: 0 });
        ownerWallet = await queryRunner.manager.save(ownerWallet);
      }
      const feeAmount = Math.round(finalAmount * (PAGO_SIMPLE_CONFIG.PLATFORM_FEE_PCT / 100) * 100) / 100;
      const netAmount = Math.round((finalAmount - feeAmount) * 100) / 100;
      const ownerNewBalance = Math.round((Number(ownerWallet.balance) + netAmount) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: ownerWallet.id }, { balance: ownerNewBalance });

      const tx = new WalletTransaction();
      tx.walletId = payerWallet.id;
      tx.type = WalletTransactionType.PAYMENT;
      tx.amount = finalAmount;
      tx.balanceAfter = payerNewBalance;
      tx.description = qr.description ? `Pago QR: ${qr.description}` : 'Pago con QR Pago Simple';
      tx.referenceId = qr.id;
      tx.referenceType = 'qr_payment';
      tx.status = WalletTransactionStatus.COMPLETED;
      await queryRunner.manager.save(tx);

      // Permanent QRs stay active; single-use QRs get marked as paid
      const newPaymentCount = (qr.paymentCount || 0) + 1;
      const newTotalCollected = Math.round(((Number(qr.totalCollected) || 0) + netAmount) * 100) / 100;
      await queryRunner.manager.update(QrPayment, { id: qr.id }, {
        status: qr.isPermanent ? QrStatus.ACTIVE : QrStatus.PAID,
        payerId: qr.isPermanent ? undefined : payerId,
        paidAt: qr.isPermanent ? undefined : new Date(),
        paymentCount: newPaymentCount,
        totalCollected: newTotalCollected,
        // Legacy fields kept for backward compat
        ...(qr.isPermanent ? {} : { payerId, paidAt: new Date() })
      });

      await queryRunner.commitTransaction();
      return {
        success: true, message: `Pago de $${finalAmount.toFixed(2)} procesado por QR`,
        amount: finalAmount, newBalance: payerNewBalance
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================================
  // LIQUIDACIONES (SETTLEMENTS)
  // ============================================================
  async getSellerSettlements(sellerId: string, page = 1, limit = 20) {
    const [settlements, total] = await this.settlementRepo.findAndCount({
      where: { sellerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const stats = await this.settlementRepo
      .createQueryBuilder('s')
      .select('SUM(s.grossAmount)', 'totalGross')
      .addSelect('SUM(s.feeAmount)', 'totalFees')
      .addSelect('SUM(s.netAmount)', 'totalNet')
      .addSelect('COUNT(*)', 'count')
      .where('s.sellerId = :sellerId', { sellerId })
      .andWhere('s.status = :status', { status: SettlementStatus.SETTLED })
      .getRawOne();

    return {
      settlements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalGross: parseFloat(stats?.totalGross || '0'),
        totalFees: parseFloat(stats?.totalFees || '0'),
        totalNet: parseFloat(stats?.totalNet || '0'),
        count: parseInt(stats?.count || '0'),
        platformFee: `${PAGO_SIMPLE_CONFIG.PLATFORM_FEE_PCT}%`,
      },
    };
  }

  async getPlatformStats() {
    const [totalLinks, paidLinks] = await Promise.all([
      this.linkRepo.count(),
      this.linkRepo.count({ where: { status: PaymentLinkStatus.PAID } }),
    ]);

    const volumeResult = await this.settlementRepo
      .createQueryBuilder('s')
      .select('SUM(s.grossAmount)', 'volume')
      .addSelect('SUM(s.feeAmount)', 'fees')
      .getRawOne();

    return {
      totalLinks,
      paidLinks,
      totalVolume: parseFloat(volumeResult?.volume || '0'),
      totalFees: parseFloat(volumeResult?.fees || '0'),
      platformFeeRate: PAGO_SIMPLE_CONFIG.PLATFORM_FEE_PCT,
      settlementDays: PAGO_SIMPLE_CONFIG.SETTLEMENT_DAYS,
      maxInstallments: PAGO_SIMPLE_CONFIG.MAX_INSTALLMENTS,
    };
  }
}
