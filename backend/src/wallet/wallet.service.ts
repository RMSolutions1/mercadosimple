import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, ILike } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from './entities/wallet-transaction.entity';
import { TransferReceipt, ReceiptType, ReceiptStatus } from './entities/transfer-receipt.entity';
import { User } from '../users/entities/user.entity';
import { DepositDto, WithdrawDto, PayWithWalletDto, TransferDto } from './dto/wallet.dto';

// ============================================================
// GENERADORES DE IDENTIDAD BANCARIA
// ============================================================
function generateCVU(): string {
  // CVU argentino: 22 dígitos numéricos
  // Prefijo Mercado Simple: 0000099 + 15 dígitos aleatorios
  const prefix = '0000099';
  const random = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
  return prefix + random;
}

const ALIAS_WORDS = [
  'CAMPO', 'SOL', 'CIELO', 'PAMPA', 'GAUCHO', 'MATE', 'PAGO', 'SIMPLE', 'PLATA',
  'FACIL', 'RAPIDO', 'DIRECTO', 'CLARO', 'FUERTE', 'LIBRE', 'UNICO', 'NUEVO',
  'BUENO', 'LISTO', 'EXACTO', 'LIMPIO', 'JUSTO', 'NETO', 'REAL', 'VIVO',
  'ALTO', 'BAJO', 'NORTE', 'SUR', 'ESTE', 'OESTE', 'AZUL', 'VERDE', 'ROJO',
  'BLANCO', 'NEGRO', 'GRIS', 'DORADO', 'PLOMO', 'NARANJA', 'CEIBO', 'QUEBRACHO',
  'OMBÚ', 'YERBA', 'ASADO', 'TANGO', 'CUMBIA', 'TORO', 'CONDOR', 'AGUILA',
];

function generateAlias(): string {
  const pick = () => ALIAS_WORDS[Math.floor(Math.random() * ALIAS_WORDS.length)];
  return `${pick()}.${pick()}.${pick()}`;
}

function generateAccountNumber(): string {
  const num = Math.floor(Math.random() * 9000000) + 1000000;
  return `MS-${num}`;
}

function generateReceiptNumber(): string {
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const random = Math.floor(Math.random() * 9000000) + 1000000;
  return `MS-TRF-${yyyymmdd}-${random}`;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(TransferReceipt)
    private receiptRepository: Repository<TransferReceipt>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // ============================================================
  // CREAR / OBTENER BILLETERA (con CVU/Alias auto-generados)
  // ============================================================
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { userId } });

    if (!wallet) {
      // Generar CVU y alias únicos con reintentos
      let cvu = generateCVU();
      let alias = generateAlias();
      let accountNumber = generateAccountNumber();

      // Garantizar unicidad
      let attempts = 0;
      while (attempts < 10) {
        const existing = await this.walletRepository.findOne({ where: [{ cvu }, { alias }, { accountNumber }] });
        if (!existing) break;
        cvu = generateCVU();
        alias = generateAlias();
        accountNumber = generateAccountNumber();
        attempts++;
      }

      wallet = this.walletRepository.create({ userId, balance: 0, cvu, alias, accountNumber });
      wallet = await this.walletRepository.save(wallet);
    } else if (!wallet.cvu) {
      // Migrar wallets existentes que no tienen CVU
      const update: Partial<Wallet> = {};
      if (!wallet.cvu) update.cvu = generateCVU();
      if (!wallet.alias) update.alias = generateAlias();
      if (!wallet.accountNumber) update.accountNumber = generateAccountNumber();
      await this.walletRepository.update({ id: wallet.id }, update);
      wallet = { ...wallet, ...update };
    }

    return wallet;
  }

  async getWallet(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'name', 'email', 'avatar'] });
    return { ...wallet, user };
  }

  // ============================================================
  // LOOKUP DE USUARIO (por CVU, alias o email)
  // ============================================================
  async lookupRecipient(query: string) {
    if (!query || query.trim().length < 3) {
      throw new BadRequestException('Ingresá al menos 3 caracteres para buscar');
    }

    const q = query.trim().toUpperCase();
    let wallet: Wallet | null = null;

    // 1) Buscar por CVU (solo dígitos)
    if (/^\d{10,22}$/.test(query.trim())) {
      wallet = await this.walletRepository.findOne({ where: { cvu: query.trim() } });
    }

    // 2) Buscar por alias (contiene puntos)
    if (!wallet && q.includes('.')) {
      wallet = await this.walletRepository.findOne({ where: { alias: q } });
    }

    // 3) Buscar por número de cuenta MS-XXXXXX
    if (!wallet && q.startsWith('MS-')) {
      wallet = await this.walletRepository.findOne({ where: { accountNumber: q } });
    }

    // 4) Buscar por email (case insensitive)
    if (!wallet) {
      const user = await this.userRepository.findOne({ where: { email: ILike(query.trim()) } });
      if (user) {
        wallet = await this.walletRepository.findOne({ where: { userId: user.id } });
        if (!wallet) wallet = await this.getOrCreateWallet(user.id);
      }
    }

    if (!wallet) throw new NotFoundException('Destinatario no encontrado. Verificá CVU, alias o email.');

    const user = await this.userRepository.findOne({
      where: { id: wallet.userId },
      select: ['id', 'name', 'email', 'avatar'],
    });

    if (!user || !user) throw new NotFoundException('Usuario no encontrado');
    if (!wallet.isActive) throw new BadRequestException('La billetera del destinatario está desactivada');

    return {
      found: true,
      recipient: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        cvu: wallet.cvu,
        alias: wallet.alias,
        accountNumber: wallet.accountNumber,
      },
    };
  }

  // ============================================================
  // DEPOSITAR SALDO
  // ============================================================
  async deposit(userId: string, dto: DepositDto) {
    // Deposits now require admin approval — create PENDING transaction
    let wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) wallet = await this.getOrCreateWallet(userId);

    if (!wallet.isActive) throw new ForbiddenException('Billetera desactivada');
    if (wallet.isFrozen)  throw new ForbiddenException('Tu billetera está temporalmente congelada. Contactá a soporte.');

    const amount = Number(dto.amount);
    if (isNaN(amount) || amount <= 0) throw new BadRequestException('Monto inválido');
    if (amount > 500_000) throw new BadRequestException('El monto máximo por operación es $500,000');

    const balanceBefore = Math.round(Number(wallet.balance || 0) * 100) / 100;

    // Create PENDING transaction — balance NOT updated yet
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: WalletTransactionType.DEPOSIT,
      status: WalletTransactionStatus.PENDING,
      amount,
      balanceAfter: balanceBefore, // unchanged until approved
      description: dto.description || `Carga de saldo via ${dto.paymentMethod || 'Tarjeta/Transferencia'}`,
      metadata: {
        paymentMethod: dto.paymentMethod,
        balanceBefore,
        pendingApproval: true,
        userId,
      },
    });
    await this.transactionRepository.save(transaction);

    // Receipt pending
    const receipt = this.receiptRepository.create({
      receiptNumber: generateReceiptNumber(),
      type: ReceiptType.DEPOSIT,
      status: ReceiptStatus.PENDING,
      senderId: userId,
      senderCvu: wallet.cvu,
      senderAlias: wallet.alias,
      senderAccountNumber: wallet.accountNumber,
      amount,
      currency: 'ARS',
      description: dto.description || `Carga de saldo — pendiente de aprobación`,
      senderBalanceBefore: balanceBefore,
      senderBalanceAfter: balanceBefore,
      senderTransactionId: transaction.id,
      metadata: { paymentMethod: dto.paymentMethod, pendingApproval: true },
    });
    await this.receiptRepository.save(receipt);

    return {
      message: 'Solicitud de carga enviada. Será acreditada una vez aprobada por el administrador.',
      amount,
      currentBalance: balanceBefore,
      status: 'pending',
      transactionId: transaction.id,
      receiptNumber: receipt.receiptNumber,
    };
  }

  async approveDeposit(transactionId: string, adminId: string) {
    const tx = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!tx) throw new NotFoundException('Transacción no encontrada');
    if (tx.status !== WalletTransactionStatus.PENDING) throw new BadRequestException('Esta transacción no está pendiente');
    if (tx.type !== WalletTransactionType.DEPOSIT) throw new BadRequestException('No es un depósito');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: tx.walletId }, lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Billetera no encontrada');

      const amount = Number(tx.amount);
      const balanceBefore = Math.round(Number(wallet.balance || 0) * 100) / 100;
      const newBalance = Math.round((balanceBefore + amount) * 100) / 100;

      await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: newBalance });
      await queryRunner.manager.update(WalletTransaction, { id: transactionId }, {
        status: WalletTransactionStatus.COMPLETED,
        balanceAfter: newBalance,
        description: tx.description + ' [Aprobado por admin]',
        metadata: { ...(tx.metadata as any || {}), approvedBy: adminId, approvedAt: new Date() },
      });
      await queryRunner.manager.update(TransferReceipt, { senderTransactionId: transactionId }, {
        status: ReceiptStatus.COMPLETED,
        senderBalanceAfter: newBalance,
      });
      await queryRunner.commitTransaction();
      return { message: 'Depósito aprobado y acreditado', amount, newBalance };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectDeposit(transactionId: string, adminId: string, reason?: string) {
    const tx = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!tx) throw new NotFoundException('Transacción no encontrada');
    if (tx.status !== WalletTransactionStatus.PENDING) throw new BadRequestException('Esta transacción no está pendiente');

    await this.transactionRepository.update({ id: transactionId }, {
      status: WalletTransactionStatus.FAILED,
      description: tx.description + ` [Rechazado: ${reason || 'sin motivo'}]`,
      metadata: { ...(tx.metadata as any || {}), rejectedBy: adminId, rejectedAt: new Date(), reason },
    });
    await this.receiptRepository.update({ senderTransactionId: transactionId }, {
      status: ReceiptStatus.FAILED,
    });
    return { message: 'Depósito rechazado' };
  }

  async getPendingDeposits(page = 1, limit = 20) {
    const [items, total] = await this.transactionRepository.findAndCount({
      where: { type: WalletTransactionType.DEPOSIT, status: WalletTransactionStatus.PENDING },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['wallet', 'wallet.user'],
    });
    return {
      deposits: items.map(tx => ({
        id: tx.id,
        amount: Number(tx.amount),
        description: tx.description,
        createdAt: tx.createdAt,
        paymentMethod: (tx.metadata as any)?.paymentMethod,
        user: {
          id: tx.wallet?.user?.id,
          name: tx.wallet?.user?.name,
          email: tx.wallet?.user?.email,
        },
        wallet: {
          id: tx.wallet?.id,
          cvu: tx.wallet?.cvu,
          alias: tx.wallet?.alias,
          currentBalance: Number(tx.wallet?.balance || 0),
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Legacy method name kept for compatibility
  private async _depositLegacy(userId: string, dto: DepositDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let wallet = await queryRunner.manager.findOne(Wallet, { where: { userId }, lock: { mode: 'pessimistic_write' } });
      if (!wallet) { wallet = await this.getOrCreateWallet(userId); wallet = await queryRunner.manager.findOne(Wallet, { where: { id: wallet.id }, lock: { mode: 'pessimistic_write' } }); }
      const amount = Number(dto.amount);
      const balanceBefore = Math.round(Number(wallet.balance || 0) * 100) / 100;
      const newBalance = Math.round((balanceBefore + amount) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: newBalance });
      await queryRunner.commitTransaction();
      return { message: 'OK', amount, newBalance };
    } catch (e) { await queryRunner.rollbackTransaction(); throw e; }
    finally { await queryRunner.release();
    }
  }

  // ============================================================
  // RETIRAR SALDO (retiro a CBU externo)
  // ============================================================
  async withdraw(userId: string, dto: WithdrawDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId }, lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Billetera no encontrada');
      if (!wallet.isActive) throw new ForbiddenException('Billetera desactivada');
      if (wallet.isFrozen) throw new ForbiddenException('Tu billetera está temporalmente congelada. Contactá a soporte.');

      const amount = Number(dto.amount);
      const balanceBefore = Math.round(Number(wallet.balance || 0) * 100) / 100;
      if (balanceBefore < amount) throw new BadRequestException(`Saldo insuficiente. Disponible: $${balanceBefore.toFixed(2)}`);

      const newBalance = Math.round((balanceBefore - amount) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: newBalance });

      const transaction = queryRunner.manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: WalletTransactionType.WITHDRAWAL,
        status: WalletTransactionStatus.COMPLETED,
        amount,
        balanceAfter: newBalance,
        description: dto.description || `Extracción a CBU ${dto.bankAccountCbu ? '···' + dto.bankAccountCbu.slice(-4) : 'registrado'}`,
        metadata: { bankAccountCbu: dto.bankAccountCbu, balanceBefore },
      });
      await queryRunner.manager.save(transaction);

      const receipt = queryRunner.manager.create(TransferReceipt, {
        receiptNumber: generateReceiptNumber(),
        type: ReceiptType.WITHDRAWAL,
        status: ReceiptStatus.COMPLETED,
        senderId: userId,
        senderCvu: wallet.cvu,
        senderAlias: wallet.alias,
        senderAccountNumber: wallet.accountNumber,
        amount,
        currency: 'ARS',
        description: `Extracción a CBU ${dto.bankAccountCbu ? '···' + dto.bankAccountCbu.slice(-4) : ''}`,
        senderBalanceBefore: balanceBefore,
        senderBalanceAfter: newBalance,
        senderTransactionId: transaction.id,
        metadata: { cbuDestino: dto.bankAccountCbu },
      });
      await queryRunner.manager.save(receipt);
      await queryRunner.commitTransaction();

      return {
        message: 'Retiro solicitado. El dinero llegará en 1-2 días hábiles.',
        amount,
        newBalance,
        transaction,
        receiptNumber: receipt.receiptNumber,
        receiptId: receipt.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================================
  // PAGAR ORDEN
  // ============================================================
  async payOrder(userId: string, dto: PayWithWalletDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId }, lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Billetera no encontrada');
      if (!wallet.isActive) throw new ForbiddenException('Billetera desactivada');
      if (wallet.isFrozen) throw new ForbiddenException('Tu billetera está temporalmente congelada. Contactá a soporte.');

      const payAmount = Number(dto.amount);
      const balanceBefore = Math.round(Number(wallet.balance || 0) * 100) / 100;
      if (balanceBefore < payAmount) throw new BadRequestException(`Saldo insuficiente. Disponible: $${balanceBefore.toFixed(2)}, requerido: $${payAmount.toFixed(2)}`);

      const newBalance = Math.round((balanceBefore - payAmount) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: newBalance });

      const transaction = queryRunner.manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: WalletTransactionType.PAYMENT,
        status: WalletTransactionStatus.COMPLETED,
        amount: payAmount,
        balanceAfter: newBalance,
        description: `Pago de orden #${dto.orderId}`,
        referenceId: dto.orderId,
        referenceType: 'order',
        metadata: { balanceBefore },
      });
      await queryRunner.manager.save(transaction);

      const receipt = queryRunner.manager.create(TransferReceipt, {
        receiptNumber: generateReceiptNumber(),
        type: ReceiptType.PAYMENT,
        status: ReceiptStatus.COMPLETED,
        senderId: userId,
        senderCvu: wallet.cvu,
        senderAlias: wallet.alias,
        senderAccountNumber: wallet.accountNumber,
        amount: payAmount,
        currency: 'ARS',
        description: `Pago de orden #${dto.orderId}`,
        senderBalanceBefore: balanceBefore,
        senderBalanceAfter: newBalance,
        senderTransactionId: transaction.id,
        metadata: { orderId: dto.orderId },
      });
      await queryRunner.manager.save(receipt);
      await queryRunner.commitTransaction();

      return {
        success: true,
        transactionId: transaction.id,
        newBalance,
        amountPaid: dto.amount,
        receiptNumber: receipt.receiptNumber,
        receiptId: receipt.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================================
  // TRANSFERENCIA INSTANTÁNEA (CVU / Alias / Email)
  // ============================================================
  async transfer(senderId: string, dto: TransferDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lookup flexible por CVU, alias o email
      const q = (dto.recipientEmail || dto.recipientQuery || '').trim();
      let recipient: User | null = null;
      let recipientWalletRef: Wallet | null = null;

      // Buscar por CVU
      if (/^\d{10,22}$/.test(q)) {
        recipientWalletRef = await queryRunner.manager.findOne(Wallet, { where: { cvu: q } });
        if (recipientWalletRef) recipient = await queryRunner.manager.findOne(User, { where: { id: recipientWalletRef.userId } });
      }
      // Buscar por alias
      if (!recipient && q.toUpperCase().includes('.')) {
        recipientWalletRef = await queryRunner.manager.findOne(Wallet, { where: { alias: q.toUpperCase() } });
        if (recipientWalletRef) recipient = await queryRunner.manager.findOne(User, { where: { id: recipientWalletRef.userId } });
      }
      // Buscar por número de cuenta MS-XXXXXX
      if (!recipient && q.toUpperCase().startsWith('MS-')) {
        recipientWalletRef = await queryRunner.manager.findOne(Wallet, { where: { accountNumber: q.toUpperCase() } });
        if (recipientWalletRef) recipient = await queryRunner.manager.findOne(User, { where: { id: recipientWalletRef.userId } });
      }
      // Buscar por email
      if (!recipient) {
        recipient = await queryRunner.manager.findOne(User, { where: { email: ILike(q) } });
      }

      if (!recipient) throw new NotFoundException('Destinatario no encontrado. Verificá el CVU, alias o email.');
      if (recipient.id === senderId) throw new BadRequestException('No podés transferirte dinero a vos mismo');

      const sender = await queryRunner.manager.findOne(User, { where: { id: senderId } });

      // Obtener billeteras
      const senderWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: senderId }, lock: { mode: 'pessimistic_write' },
      });
      if (!senderWallet) throw new NotFoundException('Tu billetera no fue encontrada');
      if (!senderWallet.isActive) throw new ForbiddenException('Tu billetera está desactivada');
      if (senderWallet.isFrozen) throw new ForbiddenException('Tu billetera está temporalmente congelada.');

      const amount = Math.round(Number(dto.amount) * 100) / 100;
      const senderBalance = Math.round(Number(senderWallet.balance || 0) * 100) / 100;
      if (senderBalance < amount) {
        throw new BadRequestException(`Saldo insuficiente. Disponible: $${senderBalance.toFixed(2)}, requerido: $${amount.toFixed(2)}`);
      }

      let recipientWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: recipient.id }, lock: { mode: 'pessimistic_write' },
      });
      if (!recipientWallet) {
        // Auto-create con CVU
        const newWallet = await this.getOrCreateWallet(recipient.id);
        recipientWallet = await queryRunner.manager.findOne(Wallet, { where: { id: newWallet.id }, lock: { mode: 'pessimistic_write' } });
      }
      if (recipientWallet.isFrozen) throw new BadRequestException('La billetera del destinatario está congelada');

      const senderNewBalance = Math.round((senderBalance - amount) * 100) / 100;
      const recipientBalance = Math.round(Number(recipientWallet.balance || 0) * 100) / 100;
      const recipientNewBalance = Math.round((recipientBalance + amount) * 100) / 100;

      await queryRunner.manager.update(Wallet, { id: senderWallet.id }, { balance: senderNewBalance });
      await queryRunner.manager.update(Wallet, { id: recipientWallet.id }, { balance: recipientNewBalance });

      const outTx = queryRunner.manager.create(WalletTransaction, {
        walletId: senderWallet.id,
        type: WalletTransactionType.TRANSFER_OUT,
        status: WalletTransactionStatus.COMPLETED,
        amount,
        balanceAfter: senderNewBalance,
        description: dto.description || `Transferencia a ${recipient.name} (${recipientWallet.alias || recipientWallet.cvu})`,
        referenceId: recipient.id,
        referenceType: 'user',
        metadata: { recipientCvu: recipientWallet.cvu, recipientAlias: recipientWallet.alias, balanceBefore: senderBalance },
      });
      const inTx = queryRunner.manager.create(WalletTransaction, {
        walletId: recipientWallet.id,
        type: WalletTransactionType.TRANSFER_IN,
        status: WalletTransactionStatus.COMPLETED,
        amount,
        balanceAfter: recipientNewBalance,
        description: dto.description || `Transferencia de ${sender?.name || 'Usuario'} (${senderWallet.alias || senderWallet.cvu})`,
        referenceId: senderId,
        referenceType: 'user',
        metadata: { senderCvu: senderWallet.cvu, senderAlias: senderWallet.alias },
      });
      const [savedOut, savedIn] = await queryRunner.manager.save([outTx, inTx]);

      // Crear comprobante oficial
      const receiptNumber = generateReceiptNumber();
      const receipt = queryRunner.manager.create(TransferReceipt, {
        receiptNumber,
        type: ReceiptType.TRANSFER,
        status: ReceiptStatus.COMPLETED,
        senderId,
        senderCvu: senderWallet.cvu,
        senderAlias: senderWallet.alias,
        senderAccountNumber: senderWallet.accountNumber,
        recipientId: recipient.id,
        recipientCvu: recipientWallet.cvu,
        recipientAlias: recipientWallet.alias,
        recipientAccountNumber: recipientWallet.accountNumber,
        amount,
        currency: 'ARS',
        description: dto.description || `Transferencia a ${recipient.name}`,
        senderBalanceBefore: senderBalance,
        senderBalanceAfter: senderNewBalance,
        senderTransactionId: savedOut.id,
        recipientTransactionId: savedIn.id,
        metadata: { senderName: sender?.name, recipientName: recipient.name, recipientEmail: recipient.email },
      });
      await queryRunner.manager.save(receipt);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Transferencia de $${amount.toFixed(2)} a ${recipient.name} realizada exitosamente`,
        amount,
        newBalance: senderNewBalance,
        recipient: {
          name: recipient.name,
          email: recipient.email,
          cvu: recipientWallet.cvu,
          alias: recipientWallet.alias,
          accountNumber: recipientWallet.accountNumber,
        },
        receiptNumber,
        receiptId: receipt.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================================
  // HISTORIAL DE TRANSACCIONES (con filtros)
  // ============================================================
  async getTransactions(userId: string, page = 1, limit = 20, filters?: {
    type?: string; from?: string; to?: string; minAmount?: number; maxAmount?: number;
  }) {
    const wallet = await this.getOrCreateWallet(userId);

    const where: any = { walletId: wallet.id };

    if (filters?.type) where.type = filters.type;
    if (filters?.from && filters?.to) {
      where.createdAt = Between(new Date(filters.from), new Date(filters.to + 'T23:59:59'));
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
        cvu: wallet.cvu,
        alias: wallet.alias,
        accountNumber: wallet.accountNumber,
      },
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // EXTRACTO BANCARIO DETALLADO
  // ============================================================
  async getAccountStatement(userId: string, from?: string, to?: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'name', 'email'] });

    const dateFrom = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    const dateTo = to ? new Date(to + 'T23:59:59') : new Date();

    const transactions = await this.transactionRepository.find({
      where: { walletId: wallet.id, createdAt: Between(dateFrom, dateTo) },
      order: { createdAt: 'ASC' },
    });

    // Calcular estadísticas del período
    let totalIn = 0, totalOut = 0;
    const txsByType: Record<string, number> = {};

    for (const tx of transactions) {
      const amt = Number(tx.amount);
      if ([WalletTransactionType.DEPOSIT, WalletTransactionType.TRANSFER_IN, WalletTransactionType.REFUND, WalletTransactionType.CASHBACK].includes(tx.type)) {
        totalIn += amt;
      } else {
        totalOut += amt;
      }
      txsByType[tx.type] = (txsByType[tx.type] || 0) + 1;
    }

    // Saldo inicial del período (balance actual - entradas + salidas del período)
    const currentBalance = Number(wallet.balance || 0);
    const openingBalance = Math.round((currentBalance - totalIn + totalOut) * 100) / 100;

    return {
      account: {
        holder: user?.name,
        email: user?.email,
        cvu: wallet.cvu,
        alias: wallet.alias,
        accountNumber: wallet.accountNumber,
        currency: 'ARS',
        entity: 'Mercado Simple S.A.',
        address: 'Buenos Aires, Argentina',
      },
      period: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
      },
      summary: {
        openingBalance: Math.round(openingBalance * 100) / 100,
        totalIn: Math.round(totalIn * 100) / 100,
        totalOut: Math.round(totalOut * 100) / 100,
        closingBalance: currentBalance,
        transactionCount: transactions.length,
        byType: txsByType,
      },
      transactions: transactions.map(tx => ({
        id: tx.id,
        date: tx.createdAt,
        type: tx.type,
        description: tx.description,
        amount: Number(tx.amount),
        balanceAfter: Number(tx.balanceAfter),
        status: tx.status,
        referenceId: tx.referenceId,
        referenceType: tx.referenceType,
        isCredit: [WalletTransactionType.DEPOSIT, WalletTransactionType.TRANSFER_IN, WalletTransactionType.REFUND, WalletTransactionType.CASHBACK].includes(tx.type),
      })),
    };
  }

  // ============================================================
  // COMPROBANTE / TICKET
  // ============================================================
  async getReceipt(receiptId: string, userId: string) {
    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId },
      relations: ['sender', 'recipient'],
    });

    if (!receipt) throw new NotFoundException('Comprobante no encontrado');
    if (receipt.senderId !== userId && receipt.recipientId !== userId) {
      throw new ForbiddenException('No tenés acceso a este comprobante');
    }

    const sender = receipt.sender;
    const recipient = receipt.recipient;

    return {
      receiptNumber: receipt.receiptNumber,
      type: receipt.type,
      status: receipt.status,
      date: receipt.createdAt,
      amount: Number(receipt.amount),
      currency: receipt.currency,
      description: receipt.description,
      sender: {
        name: sender?.name,
        email: sender?.email,
        cvu: receipt.senderCvu,
        alias: receipt.senderAlias,
        accountNumber: receipt.senderAccountNumber,
        balanceBefore: Number(receipt.senderBalanceBefore),
        balanceAfter: Number(receipt.senderBalanceAfter),
      },
      recipient: recipient ? {
        name: recipient?.name,
        email: recipient?.email,
        cvu: receipt.recipientCvu,
        alias: receipt.recipientAlias,
        accountNumber: receipt.recipientAccountNumber,
      } : null,
      isOwner: receipt.senderId === userId,
      entity: 'Mercado Simple S.A.',
      legalText: 'Comprobante válido emitido por Mercado Simple S.A. Pago Simple. CUIT 30-00000000-0.',
    };
  }

  async getMyReceipts(userId: string, page = 1, limit = 20) {
    const [receipts, total] = await this.receiptRepository.findAndCount({
      where: [{ senderId: userId }, { recipientId: userId }],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['sender', 'recipient'],
    });

    return {
      receipts: receipts.map(r => ({
        id: r.id,
        receiptNumber: r.receiptNumber,
        type: r.type,
        status: r.status,
        amount: Number(r.amount),
        description: r.description,
        date: r.createdAt,
        counterpart: r.senderId === userId ? r.recipient?.name : r.sender?.name,
        isCredit: r.recipientId === userId,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // REEMBOLSO
  // ============================================================
  async refundToWallet(userId: string, orderId: string, amount: number, description?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId }, lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) {
        wallet = await this.getOrCreateWallet(userId);
        wallet = await queryRunner.manager.findOne(Wallet, { where: { id: wallet.id }, lock: { mode: 'pessimistic_write' } });
      }
      const balanceBefore = Math.round(Number(wallet.balance || 0) * 100) / 100;
      const newBalance = Math.round((balanceBefore + amount) * 100) / 100;
      await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: newBalance });

      const tx = queryRunner.manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: WalletTransactionType.REFUND,
        status: WalletTransactionStatus.COMPLETED,
        amount,
        balanceAfter: newBalance,
        description: description || `Reembolso orden #${orderId}`,
        referenceId: orderId,
        referenceType: 'order',
      });
      await queryRunner.manager.save(tx);
      await queryRunner.commitTransaction();
      return { newBalance, transaction: tx };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
