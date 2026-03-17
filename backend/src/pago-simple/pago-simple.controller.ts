import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body,
  UseGuards, Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, IsEnum, IsPositive, Min, Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { PagoSimpleService } from './pago-simple.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentLinkType } from './entities/payment-link.entity';

class CreatePaymentLinkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(9999999)
  amount: number;

  @IsOptional()
  @IsEnum(PaymentLinkType)
  type?: PaymentLinkType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  maxInstallments?: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}

class PayLinkDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  installments?: number;
}

class GenerateQRDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(9999999)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  cuit?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  qrType?: string;

  @IsOptional()
  @IsString()
  productName?: string;
}

class PayQRDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(9999999)
  amount: number;
}

@ApiTags('Pago Simple')
@Controller('pago-simple')
export class PagoSimpleController {
  constructor(private readonly service: PagoSimpleService) {}

  // ============================================================
  // PUBLIC ENDPOINTS (no auth required)
  // ============================================================

  @Get('config')
  @ApiOperation({ summary: 'Configuración pública de Pago Simple' })
  getConfig() {
    const { PAGO_SIMPLE_CONFIG } = require('./pago-simple.service');
    return {
      platformFee: PAGO_SIMPLE_CONFIG.PLATFORM_FEE_PCT,
      settlementDays: PAGO_SIMPLE_CONFIG.SETTLEMENT_DAYS,
      maxInstallments: PAGO_SIMPLE_CONFIG.MAX_INSTALLMENTS,
    };
  }

  @Get('installments/:amount')
  @ApiOperation({ summary: 'Calcular planes de cuotas para un monto' })
  getInstallments(@Param('amount') amount: string) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return { plans: [] };
    }
    return { plans: this.service.getInstallmentPlans(parsedAmount) };
  }

  @Get('links/pay/:code')
  @ApiOperation({ summary: 'Obtener información pública de un link de pago' })
  getPaymentLink(@Param('code') code: string) {
    return this.service.getPaymentLink(code);
  }

  @Get('qr/:qrCode')
  @ApiOperation({ summary: 'Obtener información de QR para pago' })
  getQR(@Param('qrCode') qrCode: string) {
    return this.service.getQR(qrCode);
  }

  // ============================================================
  // AUTHENTICATED ENDPOINTS
  // ============================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('links')
  @ApiOperation({ summary: 'Crear link de pago' })
  createLink(@Request() req: any, @Body() dto: CreatePaymentLinkDto) {
    return this.service.createPaymentLink(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('links')
  @ApiOperation({ summary: 'Mis links de pago' })
  getMyLinks(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.getMyPaymentLinks(req.user.id, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('links/:code/pay')
  @ApiOperation({ summary: 'Pagar un link de pago' })
  payLink(@Request() req: any, @Param('code') code: string, @Body() dto: PayLinkDto) {
    return this.service.processPaymentLink(req.user.id, code, dto.installments || 1);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('links/:id')
  @ApiOperation({ summary: 'Cancelar un link de pago' })
  cancelLink(@Request() req: any, @Param('id') id: string) {
    return this.service.cancelPaymentLink(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('qr/generate')
  @ApiOperation({ summary: 'Generar QR de cobro' })
  generateQR(@Request() req: any, @Body() dto: GenerateQRDto) {
    return this.service.generateQR(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('qr/my')
  @ApiOperation({ summary: 'Listar mis QRs guardados' })
  getMyQRs(@Request() req: any) {
    return this.service.getMyQRs(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('qr/:qrId')
  @ApiOperation({ summary: 'Eliminar un QR propio' })
  deleteQR(@Request() req: any, @Param('qrId') qrId: string) {
    return this.service.deleteQR(req.user.id, qrId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('qr/:qrCode/pay')
  @ApiOperation({ summary: 'Pagar con QR' })
  payQR(@Request() req: any, @Param('qrCode') qrCode: string, @Body() dto: PayQRDto) {
    return this.service.payQR(req.user.id, qrCode, dto.amount);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('settlements')
  @ApiOperation({ summary: 'Mis liquidaciones (vendedores)' })
  getSettlements(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.getSellerSettlements(req.user.id, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de la plataforma Pago Simple' })
  getPlatformStats() {
    return this.service.getPlatformStats();
  }
}
