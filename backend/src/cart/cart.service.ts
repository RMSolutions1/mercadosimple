import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.seller', 'product.category'],
    });

    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.product?.price || 0) * item.quantity;
    }, 0);

    const shippingCost = items.some((i) => i.product?.freeShipping) ? 0 : 500;

    return {
      items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addItem(userId: string, productId: string, quantity = 1) {
    const product = await this.productRepository.findOne({
      where: { id: productId, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.stock < quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    const existing = await this.cartRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) throw new BadRequestException('Stock insuficiente');
      existing.quantity = newQty;
      return this.cartRepository.save(existing);
    }

    const item = this.cartRepository.create({ userId, productId, quantity });
    return this.cartRepository.save(item);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
      relations: ['product'],
    });
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');

    if (quantity <= 0) {
      await this.cartRepository.remove(item);
      return { message: 'Item eliminado del carrito' };
    }

    if (item.product.stock < quantity) throw new BadRequestException('Stock insuficiente');
    item.quantity = quantity;
    return this.cartRepository.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartRepository.findOne({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');
    await this.cartRepository.remove(item);
    return { message: 'Item eliminado del carrito' };
  }

  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
    return { message: 'Carrito vaciado' };
  }
}
