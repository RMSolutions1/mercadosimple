import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminService } from './admin.service';
import { SeedService } from '../database/seeds/seed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { VerificationStatus } from '../users/entities/user.entity';

class SetVerificationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

class AdminNotesDto {
  @IsString()
  notes: string;
}

class AdjustWalletDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-9999999)
  @Max(9999999)
  amount: number;

  @IsString()
  reason: string;
}

class FreezeWalletDto {
  @IsBoolean()
  freeze: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

class RetainBalanceDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(9999999)
  amount: number;

  @IsString()
  reason: string;
}

class ChangeRoleDto {
  @IsString()
  role: string;
}

class UpdateOrderStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly seedService: SeedService,
  ) {}

  @Post('seed')
  @ApiOperation({ summary: 'Ejecutar seed de la base de datos (solo producción/entorno controlado)' })
  async runSeed() {
    await this.seedService.run();
    return {
      ok: true,
      message: 'Seed ejecutado correctamente. Revisar logs del servidor para credenciales de prueba.',
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Métricas del dashboard' })
  getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar todos los usuarios con filtros' })
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllUsers(+page, +limit, search, role, status);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Detalle completo del usuario' })
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/toggle-status')
  @ApiOperation({ summary: 'Activar/desactivar usuario' })
  toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Patch('users/:id/verification')
  @ApiOperation({ summary: 'Cambiar estado de verificación del usuario' })
  setVerification(@Param('id') id: string, @Body() dto: SetVerificationDto) {
    return this.adminService.setVerificationStatus(id, dto.status, dto.notes);
  }

  @Patch('users/:id/notes')
  @ApiOperation({ summary: 'Agregar notas de admin al usuario' })
  updateNotes(@Param('id') id: string, @Body() dto: AdminNotesDto) {
    return this.adminService.updateAdminNotes(id, dto.notes);
  }

  @Patch('users/:id/wallet/adjust')
  @ApiOperation({ summary: 'Ajustar saldo de billetera (positivo o negativo)' })
  adjustWallet(@Param('id') id: string, @Body() dto: AdjustWalletDto, @Request() req: any) {
    return this.adminService.adjustWalletBalance(id, dto.amount, dto.reason, req.user.id);
  }

  @Patch('users/:id/wallet/freeze')
  @ApiOperation({ summary: 'Congelar/descongelar billetera' })
  freezeWallet(@Param('id') id: string, @Body() dto: FreezeWalletDto) {
    return this.adminService.freezeWallet(id, dto.freeze, dto.reason);
  }

  @Patch('users/:id/wallet/retain')
  @ApiOperation({ summary: 'Retener saldo por disputa' })
  retainBalance(@Param('id') id: string, @Body() dto: RetainBalanceDto) {
    return this.adminService.retainBalance(id, dto.amount, dto.reason);
  }

  @Patch('users/:id/wallet/release')
  @ApiOperation({ summary: 'Liberar saldo retenido' })
  releaseBalance(@Param('id') id: string, @Body() dto: RetainBalanceDto) {
    return this.adminService.releaseRetainedBalance(id, dto.amount, dto.reason);
  }

  @Get('users/:id/wallet')
  @ApiOperation({ summary: 'Ver billetera y transacciones del usuario' })
  getUserWallet(@Param('id') id: string) {
    return this.adminService.getWalletTransactions(id);
  }

  @Get('products')
  @ApiOperation({ summary: 'Listar todos los productos' })
  getProducts(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllProducts(+page, +limit);
  }

  @Patch('products/:id/approve')
  @ApiOperation({ summary: 'Aprobar producto' })
  approveProduct(@Param('id') id: string) {
    return this.adminService.approveProduct(id);
  }

  @Patch('products/:id/pause')
  @ApiOperation({ summary: 'Pausar producto' })
  pauseProduct(@Param('id') id: string) {
    return this.adminService.pauseProduct(id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Listar todas las órdenes' })
  getOrders(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllOrders(+page, +limit);
  }

  @Get('wallets')
  @ApiOperation({ summary: 'Listar todas las billeteras' })
  getWallets(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllWallets(+page, +limit);
  }

  @Get('deposits/pending')
  @ApiOperation({ summary: 'Listar depósitos pendientes de aprobación' })
  getPendingDeposits(@Query('page') page = 1, @Query('limit') limit = 30) {
    return this.adminService.getPendingDeposits(+page, +limit);
  }

  @Patch('deposits/:id/approve')
  @ApiOperation({ summary: 'Aprobar depósito y acreditar saldo' })
  approveDeposit(@Param('id') id: string, @Request() req: any) {
    return this.adminService.approveDeposit(id, req.user.id);
  }

  @Patch('deposits/:id/reject')
  @ApiOperation({ summary: 'Rechazar depósito' })
  rejectDeposit(@Param('id') id: string, @Body() dto: AdminNotesDto, @Request() req: any) {
    return this.adminService.rejectDeposit(id, req.user.id, dto.notes);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Listar todas las transacciones del sistema' })
  getTransactions(
    @Query('page') page = 1,
    @Query('limit') limit = 30,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminService.getAllTransactions(+page, +limit, type, from, to);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Reportes avanzados de la plataforma' })
  getReports() {
    return this.adminService.getAdvancedReports();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Cambiar rol del usuario' })
  changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto, @Request() req: any) {
    return this.adminService.changeUserRole(id, dto.role, req.user.id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de una orden' })
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(id, dto.status, dto.adminNote);
  }
}
