import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentMethod, PaymentStatusEnum } from './entities/payment.entity';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';

// Importación dinámica para compatibilidad con ESM del SDK de MP
let MercadoPagoConfig: any;
let Preference: any;
let MercadoPagoPayment: any;
let PaymentRefund: any;

async function loadMPSDK() {
  if (!MercadoPagoConfig) {
    const mp = await import('mercadopago');
    MercadoPagoConfig = mp.MercadoPagoConfig;
    Preference = mp.Preference;
    MercadoPagoPayment = mp.Payment;
    PaymentRefund = mp.PaymentRefund;
  }
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mpConfig: any = null;
  private mpEnabled = false;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private configService: ConfigService,
  ) {
    this.initMercadoPago();
  }

  private async initMercadoPago() {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    if (accessToken && !accessToken.includes('CAMBIAR')) {
      try {
        await loadMPSDK();
        this.mpConfig = new MercadoPagoConfig({ accessToken });
        this.mpEnabled = true;
        this.logger.log('Mercado Pago SDK inicializado correctamente');
      } catch (err) {
        this.logger.warn(`No se pudo inicializar Mercado Pago SDK: ${err.message}`);
      }
    } else {
      this.logger.warn('MP_ACCESS_TOKEN no configurado. Los pagos con Mercado Pago están deshabilitados.');
    }
  }

  // ── Crear preferencia de pago en Mercado Pago ────────────────────────────
  async createMercadoPagoPreference(orderId: string, appUrl: string) {
    if (!this.mpEnabled) {
      throw new BadRequestException('Mercado Pago no está configurado en este servidor');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'buyer'],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');

    try {
      const preference = new Preference(this.mpConfig);
      const items = order.items.map((item) => ({
        id: item.productId,
        title: item.productTitle,
        quantity: item.quantity,
        unit_price: Number(item.unitPrice),
        currency_id: 'ARS',
      }));

      const result = await preference.create({
        body: {
          items,
          payer: {
            email: order.buyer?.email || '',
            name: order.buyer?.name || '',
          },
          back_urls: {
            success: `${appUrl}/checkout/success?orderId=${orderId}`,
            failure: `${appUrl}/checkout/failure?orderId=${orderId}`,
            pending: `${appUrl}/checkout/pending?orderId=${orderId}`,
          },
          auto_return: 'approved',
          external_reference: orderId,
          statement_descriptor: 'MERCADO SIMPLE',
          notification_url: `${this.configService.get('APP_URL', appUrl)}/api/payments/webhook`,
        },
      });

      return {
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point,
      };
    } catch (err) {
      this.logger.error(`Error creando preferencia MP: ${err.message}`);
      throw new BadRequestException('Error al crear la preferencia de pago');
    }
  }

  // ── Webhook de Mercado Pago (IPN) ─────────────────────────────────────────
  async handleWebhook(topic: string, id: string) {
    if (topic !== 'payment' || !this.mpEnabled) return { received: true };

    try {
      await loadMPSDK();
      const mpPayment = new MercadoPagoPayment(this.mpConfig);
      const paymentData = await mpPayment.get({ id });

      const externalReference = paymentData.external_reference;
      if (!externalReference) return { received: true };

      const payment = await this.paymentRepository.findOne({
        where: { orderId: externalReference },
      });
      if (!payment) return { received: true };

      const mpStatus = paymentData.status;
      let newStatus = PaymentStatusEnum.PENDING;
      let orderStatus = OrderStatus.PROCESSING;
      let orderPaymentStatus = PaymentStatus.PENDING;

      if (mpStatus === 'approved') {
        newStatus = PaymentStatusEnum.APPROVED;
        orderStatus = OrderStatus.CONFIRMED;
        orderPaymentStatus = PaymentStatus.PAID;
      } else if (['rejected', 'cancelled'].includes(mpStatus)) {
        newStatus = PaymentStatusEnum.REJECTED;
        orderStatus = OrderStatus.CANCELLED;
        orderPaymentStatus = PaymentStatus.FAILED;
      }

      await this.paymentRepository.update(payment.id, {
        status: newStatus,
        transactionId: String(paymentData.id),
        metadata: {
          mpPaymentId: paymentData.id,
          mpStatus: paymentData.status,
          mpStatusDetail: paymentData.status_detail,
          paymentMethod: paymentData.payment_method_id,
          installments: paymentData.installments,
        },
      });

      await this.orderRepository.update(externalReference, {
        status: orderStatus,
        paymentStatus: orderPaymentStatus,
      });

      this.logger.log(`Webhook MP procesado: orden ${externalReference} → ${mpStatus}`);
      return { received: true, status: newStatus };
    } catch (err) {
      this.logger.error(`Error procesando webhook MP: ${err.message}`);
      return { received: true };
    }
  }

  // ── Reembolso ─────────────────────────────────────────────────────────────
  async refundPayment(orderId: string) {
    const payment = await this.paymentRepository.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    if (payment.status !== PaymentStatusEnum.APPROVED) {
      throw new BadRequestException('Solo se pueden reembolsar pagos aprobados');
    }

    if (this.mpEnabled && payment.transactionId) {
      try {
        await loadMPSDK();
        const refund = new PaymentRefund(this.mpConfig);
        await refund.create({ payment_id: Number(payment.transactionId), body: {} });
        this.logger.log(`Reembolso MP procesado para transacción: ${payment.transactionId}`);
      } catch (err) {
        this.logger.warn(`Advertencia al reembolsar en MP: ${err.message}`);
      }
    }

    await this.paymentRepository.update(payment.id, {
      status: PaymentStatusEnum.REFUNDED,
    });
    await this.orderRepository.update(orderId, {
      status: OrderStatus.REFUNDED,
      paymentStatus: PaymentStatus.REFUNDED,
    });

    return { success: true, message: 'Reembolso procesado correctamente' };
  }

  // ── Consultas ─────────────────────────────────────────────────────────────
  async findByOrder(orderId: string) {
    const payment = await this.paymentRepository.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  async findAll(page = 1, limit = 20) {
    const [payments, total] = await this.paymentRepository.findAndCount({
      relations: ['order', 'order.buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }
}
