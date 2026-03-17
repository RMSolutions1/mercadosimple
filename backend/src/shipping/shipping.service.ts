import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping, ShippingStatus } from './entities/shipping.entity';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
  ) {}

  async findByOrder(orderId: string) {
    const shipping = await this.shippingRepository.findOne({ where: { orderId } });
    if (!shipping) throw new NotFoundException('Envío no encontrado');
    return shipping;
  }

  async findByTracking(trackingNumber: string) {
    const shipping = await this.shippingRepository.findOne({
      where: { trackingNumber },
      relations: ['order'],
    });
    if (!shipping) throw new NotFoundException('Tracking no encontrado');
    return shipping;
  }

  async updateStatus(id: string, status: ShippingStatus) {
    await this.shippingRepository.update(id, { status });
    return this.shippingRepository.findOne({ where: { id } });
  }
}
