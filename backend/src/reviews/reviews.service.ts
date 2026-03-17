import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateReviewDto, reviewer: User) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const existing = await this.reviewRepository.findOne({
      where: { productId: dto.productId, reviewerId: reviewer.id },
    });
    if (existing) throw new BadRequestException('Ya has calificado este producto');

    const review = this.reviewRepository.create({
      ...dto,
      reviewerId: reviewer.id,
      sellerId: product.sellerId,
    });
    const saved = await this.reviewRepository.save(review);

    await this.recalculateProductRating(dto.productId);

    return saved;
  }

  async findByProduct(productId: string) {
    return this.reviewRepository.find({
      where: { productId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySeller(sellerId: string) {
    return this.reviewRepository.find({
      where: { sellerId },
      relations: ['reviewer', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  private async recalculateProductRating(productId: string) {
    const reviews = await this.reviewRepository.find({ where: { productId } });
    if (reviews.length === 0) return;

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.productRepository.update(productId, {
      rating: Math.round(avg * 10) / 10,
      reviewsCount: reviews.length,
    });
  }
}
