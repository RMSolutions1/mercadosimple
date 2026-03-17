import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';
import { IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  subtotal: number;
}

@ApiTags('Órdenes')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear orden (checkout)' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.create(dto, user);
  }

  @Post('validate-coupon')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validar cupón de descuento' })
  validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.ordersService.validateCoupon(dto.code, dto.subtotal);
  }

  @Get()
  @ApiOperation({ summary: 'Mis órdenes (comprador)' })
  findMyOrders(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.findMyOrders(user.id, +page, +limit);
  }

  @Get('seller')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Órdenes recibidas como vendedor' })
  findSellerOrders(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.findSellerOrders(user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una orden' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Actualizar estado de orden (admin/vendedor)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
