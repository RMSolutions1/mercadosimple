import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ShippingService } from './shipping.service';
import { ShippingStatus } from './entities/shipping.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

class UpdateShippingStatusDto {
  @IsEnum(ShippingStatus)
  status: ShippingStatus;
}

@ApiTags('Envíos')
@Controller('shipping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Obtener envío por orden' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.shippingService.findByOrder(orderId);
  }

  @Get('tracking/:trackingNumber')
  @ApiOperation({ summary: 'Rastrear envío por número de tracking' })
  findByTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.shippingService.findByTracking(trackingNumber);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar estado del envío (Vendedor/Admin)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateShippingStatusDto) {
    return this.shippingService.updateStatus(id, dto.status);
  }
}
