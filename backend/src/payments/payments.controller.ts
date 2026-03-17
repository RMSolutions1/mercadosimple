import {
  Controller, Get, Post, Param, Body, UseGuards, Query, Headers, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Pagos')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('mercadopago/preference/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear preferencia de pago en Mercado Pago' })
  createPreference(@Param('orderId') orderId: string) {
    const appUrl = this.configService.get('APP_URL', 'http://localhost:3002');
    return this.paymentsService.createMercadoPagoPreference(orderId, appUrl);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook de Mercado Pago (IPN)' })
  handleWebhook(
    @Query('topic') topic: string,
    @Query('id') id: string,
    @Body() body: any,
  ) {
    // MP puede enviar como query params o en el body
    const paymentTopic = topic || body?.type;
    const paymentId = id || body?.data?.id;
    return this.paymentsService.handleWebhook(paymentTopic, paymentId);
  }

  @Post('refund/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reembolsar un pago' })
  refund(@Param('orderId') orderId: string) {
    return this.paymentsService.refundPayment(orderId);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener pago por orden' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }
}
