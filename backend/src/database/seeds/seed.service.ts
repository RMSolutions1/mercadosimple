import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, VerificationStatus } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product, ProductCondition, ProductStatus } from '../../products/entities/product.entity';
import { WalletService } from '../../wallet/wallet.service';
import { randomBytes } from 'crypto';

/**
 * Publicaciones de demostración (datos ficticios, precios tipo Argentina en ARS).
 * No se copian listados de terceros; sirven para probar catálogo, carrito y panel admin.
 */
const DEMO_PRODUCTS: Array<{
  title: string;
  slugKey: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categorySlug: string;
  brand: string;
  condition: ProductCondition;
  freeShipping?: boolean;
  description: string;
  image: string;
}> = [
  {
    title: 'Notebook 15,6" Full HD — AMD Ryzen 5 — 16 GB RAM — SSD 512 GB',
    slugKey: 'notebook-ryzen5',
    price: 849_999,
    originalPrice: 929_999,
    stock: 6,
    categorySlug: 'laptops',
    brand: 'MS Alpha',
    condition: ProductCondition.NEW,
    freeShipping: true,
    description:
      'Ideal estudio y trabajo. Teclado español latinoamericano. Garantía oficial 12 meses. Envío a todo el país.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  },
  {
    title: 'Smartphone 6,7" OLED — 256 GB — 5G — cámara 50 MP',
    slugKey: 'celular-oled-256',
    price: 512_990,
    stock: 14,
    categorySlug: 'smartphones',
    brand: 'NovaPhone',
    condition: ProductCondition.NEW,
    freeShipping: true,
    description: 'Incluye cargador USB-C, funda transparente. Libre para todas las operadoras AR.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  },
  {
    title: 'Smart TV 55" 4K UHD — Android TV — HDR10',
    slugKey: 'tv-55-4k',
    price: 679_500,
    originalPrice: 749_000,
    stock: 5,
    categorySlug: 'televisores',
    brand: 'ViewMax',
    condition: ProductCondition.NEW,
    description: 'Puertos HDMI x3, Bluetooth, control por voz. Instalación opcional CABA/GBA.',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
  },
  {
    title: 'Auriculares Bluetooth con cancelación de ruido',
    slugKey: 'auris-nc',
    price: 89_990,
    stock: 40,
    categorySlug: 'audio',
    brand: 'SoundAir',
    condition: ProductCondition.NEW,
    description: 'Autonomía hasta 30 h. Estuche de carga. Perfiles de audio en app.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  },
  {
    title: 'Consola portátil — pantalla 7" — 512 GB',
    slugKey: 'consola-portatil',
    price: 589_000,
    stock: 3,
    categorySlug: 'gaming',
    brand: 'PlayGo',
    condition: ProductCondition.NEW,
    freeShipping: true,
    description: 'Incluye dock para TV. Listado para pruebas de checkout y envío.',
    image: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=800',
  },
  {
    title: 'Tablet 11" — 128 GB — lápiz incluido',
    slugKey: 'tablet-11',
    price: 349_900,
    stock: 11,
    categorySlug: 'tablets',
    brand: 'TabOne',
    condition: ProductCondition.NEW,
    description: 'Pantalla laminada, altavoces estéreo. Garantía 6 meses.',
    image: 'https://images.unsplash.com/photo-1544244015-0df4592c0c41?w=800',
  },
  {
    title: 'Heladera no frost 340 L — clase A',
    slugKey: 'heladera-340',
    price: 1_129_000,
    stock: 2,
    categorySlug: 'electrodomesticos',
    brand: 'FrescoHome',
    condition: ProductCondition.NEW,
    description: 'Entrega con coordinación. No incluye retiro de usado.',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800',
  },
  {
    title: 'Lavarropas automático 8 kg — 1400 rpm',
    slugKey: 'lavarropas-8kg',
    price: 719_990,
    stock: 4,
    categorySlug: 'electrodomesticos',
    brand: 'LimpioMax',
    condition: ProductCondition.NEW,
    description: 'Programas rápidos y eco. Manual y mangueras incluidas.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800',
  },
  {
    title: 'Sillón esquinero 3 cuerpos — tela soft',
    slugKey: 'sillon-esquinero',
    price: 459_000,
    stock: 2,
    categorySlug: 'hogar',
    brand: 'HogarSur',
    condition: ProductCondition.NEW,
    description: 'Medidas: 240x160 cm aprox. Color a confirmar por mensaje.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  },
  {
    title: 'Zapatillas running — calce 38 a 45',
    slugKey: 'zapatillas-run',
    price: 74_500,
    stock: 22,
    categorySlug: 'calzado',
    brand: 'RunStreet',
    condition: ProductCondition.NEW,
    description: 'Suela EVA, upper transpirable. Tabla de talles en fotos.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  },
  {
    title: 'Bicicleta mountain bike 29" — 21 velocidades',
    slugKey: 'mtb-29',
    price: 289_000,
    stock: 7,
    categorySlug: 'deportes',
    brand: 'TrailBike',
    condition: ProductCondition.NEW,
    freeShipping: false,
    description: 'Cuadro aluminio, frenos a disco. Armado básico incluido.',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
  },
  {
    title: 'Kit herramientas 120 piezas — maletín',
    slugKey: 'herramientas-120',
    price: 42_990,
    stock: 30,
    categorySlug: 'herramientas',
    brand: 'ProTool',
    condition: ProductCondition.NEW,
    description: 'Llaves, puntas, martillo, nivel. Uso hogar y taller liviano.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
  },
  {
    title: 'Cámara mirrorless — sensor APS-C — lente 18-55',
    slugKey: 'camara-aps-c',
    price: 912_000,
    stock: 2,
    categorySlug: 'camaras',
    brand: 'LensArt',
    condition: ProductCondition.NEW,
    freeShipping: true,
    description: 'Incluye batería y correa. Factura A o B según corresponda.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  },
  {
    title: 'Aire acondicionado split 3500 W frío/calor',
    slugKey: 'ac-3500',
    price: 598_000,
    stock: 6,
    categorySlug: 'electrodomesticos',
    brand: 'ClimaSur',
    condition: ProductCondition.NEW,
    description: 'Unidad interior y exterior. Instalación presupuestada aparte.',
    image: 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=800',
  },
];

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
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
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

    if (process.env.SEED_DEMO_USERS === 'true') {
      console.log('\n👥 SEED_DEMO_USERS=true — comprador y vendedor de prueba (no uses en producción)\n');
      await this.ensureDemoUser(
        'comprador@mercadosimple.com',
        'Comprador123*',
        UserRole.BUYER,
        'Comprador Demo',
      );
      await this.ensureDemoUser(
        'techstore@mercadosimple.com',
        'Vendedor123*',
        UserRole.SELLER,
        'Tech Store Demo',
      );
    }

    if (
      process.env.SEED_DEMO_PRODUCTS === 'true' ||
      process.env.SEED_DEMO_USERS === 'true'
    ) {
      await this.seedDemoProducts();
    }

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

  /** Comprador/vendedor fijos para E2E y pruebas locales. Solo con SEED_DEMO_USERS=true. */
  private async ensureDemoUser(
    email: string,
    plainPassword: string,
    role: UserRole,
    name: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(plainPassword, 12);
    let user = await this.userRepo.findOne({ where: { email } });
    const base = {
      password: hashed,
      name,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&bold=true`,
      reputation: role === UserRole.SELLER ? 4.5 : 0,
      totalSales: 0,
      phone: '+54 11 0000-0000',
      city: 'Buenos Aires',
      province: 'CABA',
      verificationStatus: VerificationStatus.VERIFIED,
      isActive: true,
    };
    if (!user) {
      await this.userRepo.save(this.userRepo.create({ email, ...base }));
      console.log(`  ✓ Demo ${role}: ${email}`);
    } else {
      await this.userRepo.update(user.id, base);
      console.log(`  → Demo actualizado: ${email}`);
    }
    const fresh = await this.userRepo.findOne({ where: { email } });
    if (fresh) await this.walletService.getOrCreateWallet(fresh.id);
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

  /** Publicaciones ficticias del vendedor demo para pruebas E2E (requiere techstore@ en BD). */
  private async seedDemoProducts(): Promise<void> {
    console.log(
      '\n📦 Catálogo demo — productos ficticios para Tech Store (ARS). Activado con SEED_DEMO_PRODUCTS o junto con SEED_DEMO_USERS.\n',
    );
    const seller = await this.userRepo.findOne({ where: { email: 'techstore@mercadosimple.com' } });
    if (!seller) {
      console.log('  ⚠ No existe techstore@mercadosimple.com. Creá el vendedor demo (SEED_DEMO_USERS) o registrá uno.');
      return;
    }
    let created = 0;
    for (const row of DEMO_PRODUCTS) {
      const dup = await this.productRepo.findOne({ where: { sellerId: seller.id, title: row.title } });
      if (dup) continue;
      const cat = await this.catRepo.findOne({ where: { slug: row.categorySlug } });
      if (!cat) {
        console.log(`  ⚠ Sin categoría "${row.categorySlug}" → ${row.title}`);
        continue;
      }
      const slug = `demo-${row.slugKey}-${randomBytes(3).toString('hex')}`;
      await this.productRepo.save(
        this.productRepo.create({
          title: row.title,
          slug,
          description: row.description,
          price: row.price,
          originalPrice: row.originalPrice ?? null,
          stock: row.stock,
          images: [row.image],
          status: ProductStatus.ACTIVE,
          condition: row.condition,
          freeShipping: row.freeShipping ?? false,
          brand: row.brand,
          sellerId: seller.id,
          categoryId: cat.id,
          rating: 0,
          reviewsCount: 0,
          salesCount: 0,
          viewsCount: Math.floor(Math.random() * 200),
        }),
      );
      created += 1;
    }
    console.log(`  ✓ Productos demo creados: ${created} (omitidos si ya existían por mismo título)`);
  }
}
