import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'email', 'name', 'role', 'avatar', 'reputation', 'isActive', 'createdAt'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'role', 'avatar', 'phone', 'address', 'city', 'province', 'reputation', 'totalSales', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    const { password: _, resetPasswordToken: __, resetPasswordExpires: ___, ...clean } = saved as any;
    return clean;
  }

  async deactivate(id: string) {
    await this.userRepository.update(id, { isActive: false });
    return { message: 'Usuario desactivado' };
  }

  async activate(id: string) {
    await this.userRepository.update(id, { isActive: true });
    return { message: 'Usuario activado' };
  }

  async getPublicProfile(sellerId: string) {
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
      select: ['id', 'name', 'avatar', 'city', 'province', 'reputation', 'totalSales', 'isActive', 'createdAt'],
    });
    if (!seller) throw new NotFoundException('Vendedor no encontrado');

    const reputationLevel = this.getReputationLevel(seller.reputation);
    const memberMonths = Math.floor(
      (Date.now() - new Date(seller.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    return {
      seller: {
        ...seller,
        reputationLevel,
        memberMonths,
      },
    };
  }

  async getSellerStats(sellerId: string) {
    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Vendedor no encontrado');

    const reputationLevel = this.getReputationLevel(seller.reputation);

    return {
      seller: {
        id: seller.id,
        name: seller.name,
        avatar: seller.avatar,
        reputation: seller.reputation,
        reputationLevel,
        totalSales: seller.totalSales,
        city: seller.city,
        province: seller.province,
        memberSince: seller.createdAt,
      },
    };
  }

  private getReputationLevel(reputation: number): {
    label: string;
    color: string;
    level: number;
  } {
    if (reputation >= 4.8) return { label: 'MercadoLíder Platinum', color: '#a855f7', level: 5 };
    if (reputation >= 4.5) return { label: 'MercadoLíder', color: '#f97316', level: 4 };
    if (reputation >= 4.0) return { label: 'Excelente', color: '#22c55e', level: 3 };
    if (reputation >= 3.5) return { label: 'Buena', color: '#84cc16', level: 2 };
    if (reputation >= 3.0) return { label: 'Regular', color: '#eab308', level: 1 };
    return { label: 'Nueva', color: '#6b7280', level: 0 };
  }
}
