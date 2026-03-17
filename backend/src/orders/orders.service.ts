import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { Payment, PaymentMethod, PaymentStatusEnum } from '../payments/entities/payment.entity';
import { Shipping, ShippingStatus } from '../shipping/entities/shipping.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from '../wallet/entities/wallet-transaction.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private dataSource: DataSource,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateOrderDto, buyer: User) {
    const cartItems = await this.cartRepository.find({
      where: { userId: buyer.id },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    for (const item of cartItems) {
      if (!item.product || item.product.stock < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para: ${item.product?.title}`);
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );
    const freeShipping = cartItems.some((i) => i.product.freeShipping);
    let shippingCost = freeShipping ? 0 : 500;

    // Validar cupón en el backend (la fuente de verdad está aquí, no en el frontend)
    let discount = 0;
    if (dto.couponCode) {
      const result = this.validateCoupon(dto.couponCode, subtotal);
      discount = result.discount;
      if (result.freeShipping) shippingCost = 0;
    }

    const total = subtotal + shippingCost - discount;

    const orderNumber = `MS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Verificar saldo si paga con billetera
    if (dto.paymentMethod === PaymentMethod.WALLET) {
      const wallet = await this.walletRepository.findOne({ where: { userId: buyer.id } });
      if (!wallet || Number(wallet.balance) < total) {
        throw new BadRequestException(
          `Saldo insuficiente en billetera. Saldo: $${Number(wallet?.balance || 0).toFixed(2)}, Total: $${total.toFixed(2)}`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        buyerId: buyer.id,
        subtotal,
        shippingCost,
        discount,
        total,
        shippingAddress: dto.shippingAddress,
        notes: dto.notes,
        couponCode: dto.couponCode || null,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
      });
      await queryRunner.manager.save(order);

      const orderItems = cartItems.map((item) =>
        queryRunner.manager.create(OrderItem, {
          orderId: order.id,
          productId: item.productId,
          productTitle: item.product.title,
          productImage: item.product.images?.[0] || null,
          unitPrice: item.product.price,
          quantity: item.quantity,
          subtotal: Number(item.product.price) * item.quantity,
        }),
      );
      await queryRunner.manager.save(orderItems);

      for (const item of cartItems) {
        await queryRunner.manager.decrement(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
        await queryRunner.manager.increment(
          Product,
          { id: item.productId },
          'salesCount',
          item.quantity,
        );
      }

      let walletTransactionId: string | null = null;

      // Descontar de billetera si el pago es con wallet
      if (dto.paymentMethod === PaymentMethod.WALLET) {
        const wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId: buyer.id },
          lock: { mode: 'pessimistic_write' },
        });
        const newBalance = Number(wallet.balance) - total;
        await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: newBalance });

        const walletTx = queryRunner.manager.create(WalletTransaction, {
          walletId: wallet.id,
          type: WalletTransactionType.PAYMENT,
          status: WalletTransactionStatus.COMPLETED,
          amount: total,
          balanceAfter: newBalance,
          description: `Pago orden ${orderNumber}`,
          referenceId: order.id,
          referenceType: 'order',
        });
        const savedWalletTx = await queryRunner.manager.save(walletTx);
        walletTransactionId = savedWalletTx.id;
      }

      const payment = queryRunner.manager.create(Payment, {
        orderId: order.id,
        method: dto.paymentMethod,
        status: PaymentStatusEnum.APPROVED,
        amount: total,
        transactionId: walletTransactionId || `TXN-${Date.now()}`,
        metadata: dto.paymentMethod === PaymentMethod.WALLET ? { source: 'wallet' } : null,
      });
      await queryRunner.manager.save(payment);

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

      const shipping = queryRunner.manager.create(Shipping, {
        orderId: order.id,
        carrier: 'Correo Argentino',
        trackingNumber: `TRACK-${Date.now()}`,
        status: ShippingStatus.PREPARING,
        cost: shippingCost,
        estimatedDelivery,
      });
      await queryRunner.manager.save(shipping);

      await queryRunner.manager.delete(CartItem, { userId: buyer.id });

      await queryRunner.commitTransaction();

      // Notificar al comprador
      this.notificationsService.create({
        userId: buyer.id,
        type: NotificationType.ORDER_CREATED,
        title: '¡Tu pedido fue confirmado!',
        body: `Tu pedido ${orderNumber} está confirmado. Pronto lo estaremos preparando.`,
        link: `/perfil/pedidos`,
        metadata: { orderNumber, total },
      }).catch(() => null);

      // Notificar a los vendedores involucrados
      const sellerIds = [...new Set(cartItems.map(i => i.product.sellerId).filter(Boolean))];
      for (const sellerId of sellerIds) {
        this.notificationsService.create({
          userId: sellerId,
          type: NotificationType.PAYMENT_RECEIVED,
          title: 'Nueva venta recibida',
          body: `Recibiste un nuevo pedido ${orderNumber} por $${total.toFixed(2)}.`,
          link: `/vendedor/dashboard`,
          metadata: { orderNumber, total },
        }).catch(() => null);
      }

      return this.orderRepository.findOne({
        where: { id: order.id },
        relations: ['items', 'payment', 'shipping'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findMyOrders(buyerId: string, page = 1, limit = 10) {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { buyerId },
      relations: ['items', 'payment', 'shipping'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, userRole?: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'payment', 'shipping', 'buyer'],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (userRole !== UserRole.ADMIN && order.buyerId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta orden');
    }
    return order;
  }

  async findSellerOrders(sellerId: string, page = 1, limit = 10) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .innerJoin('item.product', 'product')
      .where('product.sellerId = :sellerId', { sellerId })
      .leftJoinAndSelect('order.items', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'orderProduct')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.payment', 'payment')
      .leftJoinAndSelect('order.shipping', 'shipping')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await qb.getManyAndCount();
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAll(page = 1, limit = 20) {
    const [orders, total] = await this.orderRepository.findAndCount({
      relations: ['buyer', 'items', 'payment'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    await this.orderRepository.update(id, { status });
    return this.orderRepository.findOne({ where: { id }, relations: ['items', 'payment', 'shipping'] });
  }

  // ── Validación de cupones (fuente de verdad en el backend) ───────────────
  validateCoupon(code: string, subtotal: number): { discount: number; freeShipping: boolean; label: string } {
    const COUPONS: Record<string, { type: 'percent' | 'fixed' | 'shipping'; value: number; label: string }> = {
      'BIENVENIDO10': { type: 'percent', value: 0.10, label: '10% de descuento' },
      'MERCADO20':    { type: 'percent', value: 0.20, label: '20% de descuento' },
      'ENVIOGRATIS':  { type: 'shipping', value: 0, label: 'Envío gratis' },
      'PROMO15':      { type: 'percent', value: 0.15, label: '15% de descuento' },
    };

    const coupon = COUPONS[code.toUpperCase()];
    if (!coupon) {
      throw new BadRequestException('Cupón inválido o expirado');
    }

    if (coupon.type === 'percent') {
      return { discount: Math.round(subtotal * coupon.value * 100) / 100, freeShipping: false, label: coupon.label };
    }
    if (coupon.type === 'fixed') {
      return { discount: Math.min(coupon.value, subtotal), freeShipping: false, label: coupon.label };
    }
    // shipping
    return { discount: 0, freeShipping: true, label: coupon.label };
  }
}
