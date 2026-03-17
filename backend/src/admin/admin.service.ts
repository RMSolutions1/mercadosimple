import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, VerificationStatus } from '../users/entities/user.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from '../wallet/entities/wallet-transaction.entity';
import { TransferReceipt, ReceiptStatus } from '../wallet/entities/transfer-receipt.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private txRepository: Repository<WalletTransaction>,
    @InjectRepository(TransferReceipt)
    private receiptRepository: Repository<TransferReceipt>,
    private dataSource: DataSource,
  ) {}

  async getDashboardMetrics() {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      this.userRepository.count(),
      this.productRepository.count({ where: { status: ProductStatus.ACTIVE } }),
      this.orderRepository.count(),
    ]);

    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: 'approved' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    const pendingVerifications = await this.userRepository.count({
      where: { verificationStatus: VerificationStatus.PENDING },
    });

    const frozenWallets = await this.walletRepository.count({ where: { isFrozen: true } });

    const recentOrders = await this.orderRepository.find({
      relations: ['buyer', 'items'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const topProducts = await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ['seller', 'category'],
      order: { salesCount: 'DESC' },
      take: 5,
    });

    const salesByMonth = await this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_TRUNC('month', order.createdAt)", 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(order.total)', 'revenue')
      .groupBy("DATE_TRUNC('month', order.createdAt)")
      .orderBy('month', 'DESC')
      .limit(6)
      .getRawMany();

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingVerifications,
      frozenWallets,
      recentOrders,
      topProducts,
      salesByMonth,
      usersByRole,
    };
  }

  async getAllUsers(page = 1, limit = 20, search?: string, role?: string, status?: string) {
    const qb = this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.name', 'user.role', 'user.avatar',
               'user.phone', 'user.city', 'user.province', 'user.reputation',
               'user.totalSales', 'user.isActive', 'user.verificationStatus',
               'user.walletFrozen', 'user.createdAt', 'user.documentDni', 'user.documentCuit'])
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('(user.name ILIKE :s OR user.email ILIKE :s)', { s: `%${search}%` });
    }
    if (role) qb.andWhere('user.role = :role', { role });
    if (status === 'active') qb.andWhere('user.isActive = true');
    if (status === 'inactive') qb.andWhere('user.isActive = false');

    const [users, total] = await qb.getManyAndCount();
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllProducts(page = 1, limit = 20) {
    const [products, total] = await this.productRepository.findAndCount({
      relations: ['seller', 'category'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllOrders(page = 1, limit = 20) {
    const [orders, total] = await this.orderRepository.findAndCount({
      relations: ['buyer', 'items', 'payment'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllWallets(page = 1, limit = 20) {
    const [wallets, total] = await this.walletRepository.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { wallets, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllTransactions(page = 1, limit = 30, type?: string, from?: string, to?: string) {
    const qb = this.txRepository.createQueryBuilder('tx')
      .leftJoinAndSelect('tx.wallet', 'wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .orderBy('tx.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (type) qb.andWhere('tx.type = :type', { type });
    if (from) qb.andWhere('tx.createdAt >= :from', { from: new Date(from) });
    if (to) qb.andWhere('tx.createdAt <= :to', { to: new Date(to) });

    const [transactions, total] = await qb.getManyAndCount();
    const totalAmount = await this.txRepository.createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'sum')
      .where('tx.status = :s', { s: 'completed' })
      .getRawOne();

    return { transactions, total, page, totalPages: Math.ceil(total / limit), totalVolume: parseFloat(totalAmount?.sum || '0') };
  }

  async changeUserRole(userId: string, newRole: string, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const oldRole = user.role;
    user.role = newRole as any;
    await this.userRepository.save(user);
    return { message: `Rol cambiado de ${oldRole} a ${newRole}`, role: newRole };
  }

  async updateOrderStatus(orderId: string, status: string, adminNote?: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['buyer', 'items'] });
    if (!order) throw new NotFoundException('Orden no encontrada');
    const oldStatus = order.status;
    order.status = status as any;
    if (adminNote) (order as any).adminNote = adminNote;
    await this.orderRepository.save(order);
    return { message: `Estado de orden cambiado de ${oldStatus} a ${status}`, status };
  }

  async getAdvancedReports() {
    const [totalUsers, totalSellers, totalBuyers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { role: 'seller' as any } }),
      this.userRepository.count({ where: { role: 'buyer' as any } }),
      this.productRepository.count(),
      this.orderRepository.count(),
      this.paymentRepository.createQueryBuilder('p').select('SUM(p.amount)', 'total').where('p.status = :s', { s: 'approved' }).getRawOne(),
    ]);

    const monthlySales = await this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_TRUNC('month', order.createdAt)", 'month')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('SUM(order.total)', 'revenue')
      .groupBy("DATE_TRUNC('month', order.createdAt)")
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    const topSellers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'seller' })
      .orderBy('user.totalSales', 'DESC')
      .take(5)
      .getMany();

    const ordersByStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const newUsersToday = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today: new Date(new Date().setHours(0, 0, 0, 0)) })
      .getCount();

    const totalWalletBalance = await this.walletRepository
      .createQueryBuilder('w')
      .select('SUM(w.balance)', 'total')
      .getRawOne();

    return {
      summary: {
        totalUsers,
        totalSellers,
        totalBuyers,
        totalProducts,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue?.total || '0'),
        newUsersToday,
        totalWalletBalance: parseFloat(totalWalletBalance?.total || '0'),
      },
      monthlySales,
      topSellers,
      ordersByStatus,
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'role', 'avatar', 'phone', 'city', 'province',
               'reputation', 'totalSales', 'isActive', 'verificationStatus',
               'verificationNotes', 'documentDni', 'documentCuit', 'adminNotes',
               'walletFrozen', 'walletFrozenReason', 'createdAt'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    const orderCount = await this.orderRepository.count({ where: { buyerId: userId } });

    return { ...user, wallet, orderCount };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    return { message: `Usuario ${user.isActive ? 'activado' : 'desactivado'}`, isActive: user.isActive };
  }

  async setVerificationStatus(userId: string, status: VerificationStatus, notes?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.verificationStatus = status;
    if (notes) user.verificationNotes = notes;
    await this.userRepository.save(user);
    return { message: `Verificación actualizada a: ${status}`, verificationStatus: status };
  }

  async updateAdminNotes(userId: string, notes: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.adminNotes = notes;
    await this.userRepository.save(user);
    return { message: 'Notas actualizadas' };
  }

  async adjustWalletBalance(userId: string, amount: number, reason: string, adminId: string) {
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      throw new BadRequestException('Monto inválido');
    }
    if (Math.abs(parsedAmount) > 9_999_999) {
      throw new BadRequestException('El monto máximo es $9,999,999');
    }

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Billetera no encontrada');

    const previousBalance = Number(wallet.balance) || 0;
    const newBalance = Math.round((previousBalance + parsedAmount) * 100) / 100;
    if (newBalance < 0) throw new BadRequestException('El saldo no puede quedar negativo');

    // Use update() to avoid saving corrupted entity state
    await this.walletRepository.update({ id: wallet.id }, { balance: newBalance });

    // Registrar transacción
    const tx = new WalletTransaction();
    tx.walletId = wallet.id;
    tx.type = parsedAmount > 0 ? WalletTransactionType.DEPOSIT : WalletTransactionType.WITHDRAWAL;
    tx.amount = Math.abs(parsedAmount);
    tx.balanceAfter = newBalance;
    tx.description = `Ajuste por admin: ${reason}`;
    tx.status = WalletTransactionStatus.COMPLETED;
    await this.txRepository.save(tx);

    return { message: `Saldo ajustado. Nuevo balance: $${newBalance}`, balance: newBalance };
  }

  async freezeWallet(userId: string, freeze: boolean, reason?: string) {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Billetera no encontrada');

    wallet.isFrozen = freeze;
    if (freeze && reason) wallet.frozenReason = reason;
    if (!freeze) wallet.frozenReason = null;

    // También actualizar en el usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.walletFrozen = freeze;
      user.walletFrozenReason = freeze ? reason : null;
      await this.userRepository.save(user);
    }

    await this.walletRepository.save(wallet);
    return { message: `Billetera ${freeze ? 'congelada' : 'descongelada'}`, isFrozen: freeze };
  }

  async retainBalance(userId: string, amount: number, reason: string) {
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) throw new BadRequestException('Monto inválido');

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Billetera no encontrada');

    const available = Number(wallet.balance) || 0;
    if (available < parsedAmount) throw new BadRequestException('Saldo insuficiente para retener');

    const newBalance = Math.round((available - parsedAmount) * 100) / 100;
    const newFrozen = Math.round((Number(wallet.frozenBalance || 0) + parsedAmount) * 100) / 100;
    await this.walletRepository.update({ id: wallet.id }, { balance: newBalance, frozenBalance: newFrozen });

    const tx = new WalletTransaction();
    tx.walletId = wallet.id;
    tx.type = WalletTransactionType.WITHDRAWAL;
    tx.amount = parsedAmount;
    tx.balanceAfter = newBalance;
    tx.description = `Retención por disputa: ${reason}`;
    tx.status = WalletTransactionStatus.COMPLETED;
    await this.txRepository.save(tx);

    return { message: `Retenidos $${parsedAmount} ARS por: ${reason}` };
  }

  async releaseRetainedBalance(userId: string, amount: number, reason: string) {
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) throw new BadRequestException('Monto inválido');

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Billetera no encontrada');

    const frozen = Number(wallet.frozenBalance || 0);
    const toRelease = Math.min(parsedAmount, frozen);
    const newBalance = Math.round((Number(wallet.balance || 0) + toRelease) * 100) / 100;
    const newFrozen = Math.round((frozen - toRelease) * 100) / 100;
    await this.walletRepository.update({ id: wallet.id }, { balance: newBalance, frozenBalance: newFrozen });

    const tx2 = new WalletTransaction();
    tx2.walletId = wallet.id;
    tx2.type = WalletTransactionType.DEPOSIT;
    tx2.amount = toRelease;
    tx2.balanceAfter = newBalance;
    tx2.description = `Liberación de retención: ${reason}`;
    tx2.status = WalletTransactionStatus.COMPLETED;
    await this.txRepository.save(tx2);

    return { message: `Liberados $${toRelease} ARS`, releasedAmount: toRelease };
  }

  async approveProduct(productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    product.status = ProductStatus.ACTIVE;
    await this.productRepository.save(product);
    return { message: 'Producto aprobado' };
  }

  async pauseProduct(productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    product.status = ProductStatus.PAUSED;
    await this.productRepository.save(product);
    return { message: 'Producto pausado' };
  }

  async getWalletTransactions(userId: string, limit = 20) {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Billetera no encontrada');
    const transactions = await this.txRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return { wallet, transactions };
  }

  // ── Depósitos pendientes de aprobación ──
  async getPendingDeposits(page = 1, limit = 30) {
    const [items, total] = await this.txRepository.findAndCount({
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

  async approveDeposit(transactionId: string, adminId: string) {
    const tx = await this.txRepository.findOne({ where: { id: transactionId }, relations: ['wallet'] });
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
        description: (tx.description || '') + ' [Aprobado por admin]',
        metadata: { ...(tx.metadata as any || {}), approvedBy: adminId, approvedAt: new Date().toISOString() },
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
    const tx = await this.txRepository.findOne({ where: { id: transactionId } });
    if (!tx) throw new NotFoundException('Transacción no encontrada');
    if (tx.status !== WalletTransactionStatus.PENDING) throw new BadRequestException('Esta transacción no está pendiente');

    await this.txRepository.update({ id: transactionId }, {
      status: WalletTransactionStatus.FAILED,
      description: (tx.description || '') + ` [Rechazado: ${reason || 'sin motivo'}]`,
      metadata: { ...(tx.metadata as any || {}), rejectedBy: adminId, rejectedAt: new Date().toISOString(), reason },
    });
    await this.receiptRepository.update({ senderTransactionId: transactionId }, {
      status: ReceiptStatus.FAILED,
    });
    return { message: 'Depósito rechazado' };
  }
}
