import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, VerificationStatus } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { WalletService } from '../../wallet/wallet.service';

/**
 * Bootstrap del marketplace: un solo usuario administrador (dueño) y categorías vacías de productos.
 * Vendedores y compradores se crean solo vía POST /auth/register.
 */
const DEFAULT_CATEGORIES: Array<{ name: string; slug: string; icon: string; image: string }> = [
  { name: 'Smartphones', slug: 'smartphones', icon: '📱', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
  { name: 'Televisores', slug: 'televisores', icon: '📺', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400' },
  { name: 'Laptops y PC', slug: 'laptops', icon: '💻', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
  { name: 'Audio y Auriculares', slug: 'audio', icon: '🎧', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
  { name: 'Gaming y Consolas', slug: 'gaming', icon: '🎮', image: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400' },
  { name: 'Tablets', slug: 'tablets', icon: '📲', image: 'https://images.unsplash.com/photo-1544244015-0df4592c0c41?w=400' },
  { name: 'Cámaras y Video', slug: 'camaras', icon: '📷', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
  { name: 'Electrodomésticos', slug: 'electrodomesticos', icon: '🏠', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400' },
  { name: 'Muebles y Deco', slug: 'hogar', icon: '🛋️', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
  { name: 'Ropa y Accesorios', slug: 'ropa', icon: '👕', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400' },
  { name: 'Calzado', slug: 'calzado', icon: '👟', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { name: 'Deportes y Fitness', slug: 'deportes', icon: '⚽', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' },
  { name: 'Automotor', slug: 'automotor', icon: '🚗', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400' },
  { name: 'Agro y Campo', slug: 'agro', icon: '🌾', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
  { name: 'Herramientas', slug: 'herramientas', icon: '🔧', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
  { name: 'Bebés y Niños', slug: 'bebes', icon: '🍼', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
  { name: 'Salud y Belleza', slug: 'salud', icon: '💊', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400' },
  { name: 'Libros y Educación', slug: 'libros', icon: '📚', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' },
  { name: 'Mascotas', slug: 'mascotas', icon: '🐾', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400' },
  { name: 'Colección y Arte', slug: 'arte', icon: '🎨', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400' },
  { name: 'Otros', slug: 'otros', icon: '📦', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400' },
];

@Injectable()
export class SeedService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private readonly catRepo: Repository<Category>,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Solo administrador + categorías. Idempotente: actualiza contraseña del admin si ya existe.
   */
  async run(): Promise<void> {
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@mercadosimple.com';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'CambiarEstaClave2026!';

    console.log('\n🚀 MERCADO SIMPLE — Bootstrap (dueño + categorías)\n');

    await this.ensureAdmin(adminEmail, adminPassword);
    await this.seedCategories();

    console.log('\n✅ Bootstrap listo.');
    console.log(`\n👤 Administrador (dueño): ${adminEmail}`);
    console.log('   Contraseña: la definida en ADMIN_SEED_PASSWORD o la por defecto del primer arranque.');
    console.log('   Cambiala en producción con ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD en .env o Fly secrets.\n');
  }

  /**
   * Borra todos los datos de negocio y vuelve a ejecutar run().
   * Solo invocar desde entorno controlado (admin autenticado + confirmación explícita).
   */
  async resetPlatformAndBootstrap(confirmToken: string): Promise<void> {
    const expected = 'ELIMINAR_TODO_Y_REINICIAR';
    if (confirmToken !== expected) {
      throw new BadRequestException(
        `Confirmación inválida. Enviá JSON { "confirm": "${expected}" }.`,
      );
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    try {
      await qr.query(`
        TRUNCATE TABLE
          messages,
          conversations,
          cart_items,
          favorites,
          order_items,
          orders,
          payments,
          shipping,
          reviews,
          questions,
          notifications,
          wallet_transactions,
          transfer_receipts,
          wallets,
          payment_links,
          qr_payments,
          settlements,
          products,
          categories,
          users
        RESTART IDENTITY CASCADE;
      `);
    } finally {
      await qr.release();
    }

    await this.run();
  }

  private async ensureAdmin(email: string, plainPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(plainPassword, 12);
    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      user = await this.userRepo.save(
        this.userRepo.create({
          email,
          password: hashed,
          name: 'Administrador — Dueño',
          role: UserRole.ADMIN,
          avatar: 'https://ui-avatars.com/api/?name=Admin+MS&background=7C3AED&color=fff&size=200&bold=true',
          reputation: 5,
          totalSales: 0,
          phone: '+54 11 0000-0000',
          city: 'Buenos Aires',
          province: 'CABA',
          verificationStatus: VerificationStatus.VERIFIED,
          isActive: true,
        }),
      );
      console.log(`  ✓ Admin creado: ${email}`);
    } else {
      await this.userRepo.update(user.id, {
        password: hashed,
        role: UserRole.ADMIN,
        isActive: true,
        verificationStatus: VerificationStatus.VERIFIED,
      });
      console.log(`  → Admin actualizado: ${email}`);
    }

    const fresh = await this.userRepo.findOne({ where: { email } });
    if (fresh) {
      await this.walletService.getOrCreateWallet(fresh.id);
    }
  }

  private async seedCategories(): Promise<void> {
    console.log('\n📂 Categorías para publicaciones...');
    for (const c of DEFAULT_CATEGORIES) {
      const existing = await this.catRepo.findOne({ where: { slug: c.slug } });
      if (!existing) {
        await this.catRepo.save(this.catRepo.create(c));
        console.log(`  ✓ ${c.icon} ${c.name}`);
      }
    }
  }
}
