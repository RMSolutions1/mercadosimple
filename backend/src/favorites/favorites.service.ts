import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async toggle(userId: string, productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { isFavorite: false, message: 'Eliminado de favoritos' };
    }

    const fav = this.favoriteRepository.create({ userId, productId });
    await this.favoriteRepository.save(fav);
    return { isFavorite: true, message: 'Agregado a favoritos' };
  }

  async findMyFavorites(userId: string) {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['product', 'product.seller', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async isFavorite(userId: string, productId: string) {
    const fav = await this.favoriteRepository.findOne({ where: { userId, productId } });
    return { isFavorite: !!fav };
  }
}
