import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(query: QueryProductDto) {
    const {
      search,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      condition,
      sortBy = 'newest',
      minRating,
      freeShipping,
      page = 1,
      limit = 20,
      sellerId,
    } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .select([
        'product',
        'category.id',
        'category.name',
        'category.slug',
        'seller.id',
        'seller.name',
        'seller.reputation',
        'seller.avatar',
      ]);

    if (search) {
      qb.andWhere(
        '(LOWER(product.title) LIKE :search OR LOWER(product.description) LIKE :search OR LOWER(product.brand) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (condition) {
      qb.andWhere('product.condition = :condition', { condition });
    }

    if (minRating) {
      qb.andWhere('product.rating >= :minRating', { minRating });
    }

    if (freeShipping === 'true') {
      qb.andWhere('product.freeShipping = :freeShipping', { freeShipping: true });
    }

    if (sellerId) {
      qb.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    switch (sortBy) {
      case 'price_asc':
        qb.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('product.price', 'DESC');
        break;
      case 'rating':
        qb.orderBy('product.rating', 'DESC');
        break;
      case 'sales':
        qb.orderBy('product.salesCount', 'DESC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    qb.skip((page - 1) * limit).take(limit);
    const products = await qb.getMany();

    return {
      products,
      total,
      page: +page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured() {
    return this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ['category', 'seller'],
      order: { salesCount: 'DESC', rating: 'DESC' },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        originalPrice: true,
        images: true,
        rating: true,
        reviewsCount: true,
        freeShipping: true,
        condition: true,
        category: { id: true, name: true, slug: true },
        seller: { id: true, name: true, reputation: true },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id, status: ProductStatus.ACTIVE },
      relations: ['category', 'seller', 'reviews', 'reviews.reviewer'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.productRepository.increment({ id }, 'viewsCount', 1);
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug, status: ProductStatus.ACTIVE },
      relations: ['category', 'seller', 'reviews', 'reviews.reviewer'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.productRepository.increment({ id: product.id }, 'viewsCount', 1);
    return product;
  }

  async create(dto: CreateProductDto, seller: User) {
    const slug = this.generateSlug(dto.title);
    const product = this.productRepository.create({
      ...dto,
      slug,
      sellerId: seller.id,
    });
    return this.productRepository.save(product);
  }

  async update(id: string, dto: Partial<CreateProductDto>, user: User) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.sellerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: string, user: User) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.sellerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }

    product.status = ProductStatus.DELETED;
    await this.productRepository.save(product);
    return { message: 'Producto eliminado' };
  }

  async getSellerProducts(sellerId: string) {
    return this.productRepository.find({
      where: { sellerId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `${base}-${Date.now()}`;
  }
}
