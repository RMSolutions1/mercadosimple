import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, VerificationStatus } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product, ProductCondition, ProductStatus } from '../../products/entities/product.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from '../../wallet/entities/wallet-transaction.entity';
import { Question, QuestionStatus } from '../../questions/entities/question.entity';
import { Notification, NotificationType } from '../../notifications/entities/notification.entity';

function makeCVU(seed: number): string {
  const base = String(seed).padStart(15, '0');
  return `0000099${base}`;
}
function makeAlias(words: string[]): string { return words.join('.'); }
function makeAccountNumber(n: number): string { return `MS-${String(n).padStart(7, '0')}`; }

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)       private userRepo: Repository<User>,
    @InjectRepository(Category)   private catRepo: Repository<Category>,
    @InjectRepository(Product)    private productRepo: Repository<Product>,
    @InjectRepository(Review)     private reviewRepo: Repository<Review>,
    @InjectRepository(Wallet)     private walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction) private walletTxRepo: Repository<WalletTransaction>,
    @InjectRepository(Question)   private questionRepo: Repository<Question>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async run() {
    console.log('\n🚀 ===== MERCADO SIMPLE — SEED COMPLETO =====\n');
    const users    = await this.seedUsers();
    const cats     = await this.seedCategories();
    const products = await this.seedProducts(users, cats);
    await this.seedReviews(users, products);
    await this.seedQuestions(users, products);
    await this.seedWallets(users);
    await this.seedNotifications(users);
    console.log('\n✅ ===== SEED COMPLETADO EXITOSAMENTE =====');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('  ADMIN    → admin@mercadosimple.com       / Admin123*');
    console.log('  VENDEDOR → techstore@mercadosimple.com   / Vendedor123*');
    console.log('  VENDEDOR → modaba@mercadosimple.com      / Vendedor123*');
    console.log('  VENDEDOR → casahogar@mercadosimple.com   / Vendedor123*');
    console.log('  VENDEDOR → deportesplus@mercadosimple.com/ Vendedor123*');
    console.log('  VENDEDOR → agrosimple@mercadosimple.com  / Vendedor123*');
    console.log('  COMPRADOR→ maria.garcia@gmail.com        / Comprador123*');
    console.log('  COMPRADOR→ carlos.lopez@gmail.com        / Comprador123*');
    console.log('  COMPRADOR→ ana.fernandez@gmail.com       / Comprador123*');
    console.log('  COMPRADOR→ comprador@mercadosimple.com   / Comprador123*\n');
  }

  // ─────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────
  private async seedUsers(): Promise<Record<string, User>> {
    console.log('👥 Creando usuarios...');
    const usersData = [
      // ADMIN
      {
        email: 'admin@mercadosimple.com', password: 'Admin123*',
        name: 'Administrador Mercado Simple', role: UserRole.ADMIN,
        avatar: 'https://ui-avatars.com/api/?name=Admin+MS&background=7C3AED&color=fff&size=200&bold=true',
        reputation: 5.0, totalSales: 0, phone: '+54 11 4000-0001',
        city: 'Buenos Aires', province: 'CABA',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      // VENDEDORES
      {
        email: 'techstore@mercadosimple.com', password: 'Vendedor123*',
        name: 'TechStore Argentina', role: UserRole.SELLER,
        avatar: 'https://ui-avatars.com/api/?name=TechStore+AR&background=1D4ED8&color=fff&size=200&bold=true',
        reputation: 4.9, totalSales: 3847,
        phone: '+54 11 4123-4567', city: 'Buenos Aires', province: 'CABA',
        address: 'Av. Corrientes 1234, Piso 3',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'modaba@mercadosimple.com', password: 'Vendedor123*',
        name: 'ModaBA — Ropa y Calzado', role: UserRole.SELLER,
        avatar: 'https://ui-avatars.com/api/?name=ModaBA&background=EC4899&color=fff&size=200&bold=true',
        reputation: 4.7, totalSales: 2103,
        phone: '+54 11 5234-5678', city: 'Buenos Aires', province: 'CABA',
        address: 'Av. Santa Fe 3456',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'casahogar@mercadosimple.com', password: 'Vendedor123*',
        name: 'CasaHogar — Muebles y Deco', role: UserRole.SELLER,
        avatar: 'https://ui-avatars.com/api/?name=CasaHogar&background=10B981&color=fff&size=200&bold=true',
        reputation: 4.6, totalSales: 956,
        phone: '+54 11 6345-6789', city: 'Rosario', province: 'Santa Fe',
        address: 'Bv. Oroño 789',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'deportesplus@mercadosimple.com', password: 'Vendedor123*',
        name: 'DeportesPlus — Todo para el Deporte', role: UserRole.SELLER,
        avatar: 'https://ui-avatars.com/api/?name=Deportes+Plus&background=F59E0B&color=fff&size=200&bold=true',
        reputation: 4.8, totalSales: 1672,
        phone: '+54 351 234-5678', city: 'Córdoba', province: 'Córdoba',
        address: 'Av. Colón 1234',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'agrosimple@mercadosimple.com', password: 'Vendedor123*',
        name: 'AgroSimple — Campo y Ganadería', role: UserRole.SELLER,
        avatar: 'https://ui-avatars.com/api/?name=AgroSimple&background=65A30D&color=fff&size=200&bold=true',
        reputation: 4.5, totalSales: 423,
        phone: '+54 341 456-7890', city: 'Rosario', province: 'Santa Fe',
        address: 'Ruta 9 Km 280',
        verificationStatus: VerificationStatus.PENDING,
      },
      // COMPRADORES
      {
        email: 'comprador@mercadosimple.com', password: 'Comprador123*',
        name: 'Usuario Demo', role: UserRole.BUYER,
        avatar: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=6366F1&color=fff&size=200',
        reputation: 4.2, totalSales: 0, city: 'Córdoba', province: 'Córdoba',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'maria.garcia@gmail.com', password: 'Comprador123*',
        name: 'María García', role: UserRole.BUYER,
        avatar: 'https://ui-avatars.com/api/?name=Maria+G&background=F472B6&color=fff&size=200',
        reputation: 4.5, totalSales: 0, city: 'Buenos Aires', province: 'CABA',
        phone: '+54 11 2345-6789',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'carlos.lopez@gmail.com', password: 'Comprador123*',
        name: 'Carlos López', role: UserRole.BUYER,
        avatar: 'https://ui-avatars.com/api/?name=Carlos+L&background=0EA5E9&color=fff&size=200',
        reputation: 4.0, totalSales: 0, city: 'Mendoza', province: 'Mendoza',
        phone: '+54 261 345-6789',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'ana.fernandez@gmail.com', password: 'Comprador123*',
        name: 'Ana Fernández', role: UserRole.BUYER,
        avatar: 'https://ui-avatars.com/api/?name=Ana+F&background=34D399&color=fff&size=200',
        reputation: 4.8, totalSales: 0, city: 'Rosario', province: 'Santa Fe',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        email: 'pedro.martinez@gmail.com', password: 'Comprador123*',
        name: 'Pedro Martínez', role: UserRole.BUYER,
        avatar: 'https://ui-avatars.com/api/?name=Pedro+M&background=FBBF24&color=fff&size=200',
        reputation: 3.9, totalSales: 0, city: 'Tucumán', province: 'Tucumán',
        verificationStatus: VerificationStatus.VERIFIED,
      },
    ];

    const result: Record<string, User> = {};
    for (const u of usersData) {
      let user = await this.userRepo.findOne({ where: { email: u.email } });
      if (!user) {
        const hashed = await bcrypt.hash(u.password, 12);
        user = await this.userRepo.save(this.userRepo.create({ ...u, password: hashed }));
        console.log(`  ✓ ${u.role.padEnd(6)} ${u.name}`);
      } else {
        // Update password to ensure it's current
        const hashed = await bcrypt.hash(u.password, 12);
        await this.userRepo.update(user.id, { password: hashed, reputation: u.reputation, totalSales: u.totalSales, verificationStatus: u.verificationStatus });
        user = { ...user, ...u };
        console.log(`  → Actualizado: ${u.email}`);
      }
      result[u.email] = user as User;
    }
    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────────────────────
  private async seedCategories(): Promise<Record<string, Category>> {
    console.log('\n📂 Creando categorías...');
    const catsData = [
      { name: 'Smartphones',         slug: 'smartphones',         icon: '📱', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
      { name: 'Televisores',          slug: 'televisores',          icon: '📺', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400' },
      { name: 'Laptops y PC',         slug: 'laptops',             icon: '💻', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
      { name: 'Audio y Auriculares',  slug: 'audio',               icon: '🎧', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
      { name: 'Gaming y Consolas',    slug: 'gaming',              icon: '🎮', image: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400' },
      { name: 'Tablets',              slug: 'tablets',             icon: '📲', image: 'https://images.unsplash.com/photo-1544244015-0df4592c0c41?w=400' },
      { name: 'Cámaras y Video',      slug: 'camaras',             icon: '📷', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
      { name: 'Electrodomésticos',    slug: 'electrodomesticos',   icon: '🏠', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400' },
      { name: 'Muebles y Deco',       slug: 'hogar',               icon: '🛋️', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
      { name: 'Ropa y Accesorios',    slug: 'ropa',                icon: '👕', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400' },
      { name: 'Calzado',              slug: 'calzado',             icon: '👟', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
      { name: 'Deportes y Fitness',   slug: 'deportes',            icon: '⚽', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' },
      { name: 'Automotor',            slug: 'automotor',           icon: '🚗', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400' },
      { name: 'Agro y Campo',         slug: 'agro',                icon: '🌾', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
      { name: 'Herramientas',         slug: 'herramientas',        icon: '🔧', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
      { name: 'Bebés y Niños',        slug: 'bebes',               icon: '🍼', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { name: 'Salud y Belleza',      slug: 'salud',               icon: '💊', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400' },
      { name: 'Libros y Educación',   slug: 'libros',              icon: '📚', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' },
      { name: 'Mascotas',             slug: 'mascotas',            icon: '🐾', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400' },
      { name: 'Colección y Arte',     slug: 'arte',                icon: '🎨', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400' },
    ];

    const result: Record<string, Category> = {};
    for (const c of catsData) {
      let cat = await this.catRepo.findOne({ where: { slug: c.slug } });
      if (!cat) {
        cat = await this.catRepo.save(this.catRepo.create(c));
        console.log(`  ✓ ${c.icon} ${c.name}`);
      }
      result[c.slug] = cat;
    }
    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // PRODUCTS — 60+ productos distribuidos en 5 tiendas
  // ─────────────────────────────────────────────────────────────
  private async seedProducts(users: Record<string, User>, cats: Record<string, Category>): Promise<Product[]> {
    console.log('\n📦 Creando productos...');

    const ts  = users['techstore@mercadosimple.com'];
    const mb  = users['modaba@mercadosimple.com'];
    const ch  = users['casahogar@mercadosimple.com'];
    const dp  = users['deportesplus@mercadosimple.com'];
    const ag  = users['agrosimple@mercadosimple.com'];

    const P = (slug: string, title: string, desc: string, price: number, oldPrice: number,
      images: string[], catSlug: string, brand: string, model: string,
      stock: number, free: boolean, rating: number, reviews: number, sales: number,
      sellerUser: User, condition = ProductCondition.NEW) => ({
        slug, title, description: desc, price, originalPrice: oldPrice,
        images, categorySlug: catSlug, brand, model, stock,
        freeShipping: free, rating, reviewsCount: reviews, salesCount: sales,
        sellerId: sellerUser?.id, condition,
    });

    const products = [
      // ── TechStore Argentina ──
      P('iphone-15-pro-256gb','Apple iPhone 15 Pro 256GB',
        'El iPhone más avanzado. Chip A17 Pro, Dynamic Island, cámara de 48MP con zoom óptico 5x, pantalla Super Retina XDR ProMotion 120Hz de 6.1" y titanio de grado aeroespacial. USB-C.',
        1499,1799,['https://images.unsplash.com/photo-1696446701796-da61339a68d5?w=600','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'],'smartphones','Apple','iPhone 15 Pro',10,true,4.9,412,87,ts),

      P('samsung-galaxy-s24-ultra','Samsung Galaxy S24 Ultra 256GB',
        'Smartphone Samsung Galaxy S24 Ultra con pantalla Dynamic AMOLED 2X de 6.8" QHD+, chip Snapdragon 8 Gen 3, S-Pen integrado y sistema de cámaras de 200MP. Galaxy AI.',
        1299,1599,['https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600','https://images.unsplash.com/photo-1587816401084-c2eb4a04cb29?w=600'],'smartphones','Samsung','Galaxy S24 Ultra',8,true,4.8,289,54,ts),

      P('motorola-moto-g84-256gb','Motorola Moto G84 5G 256GB',
        'El mejor celular gama media del mercado. Pantalla pOLED Full HD+ 6.5" 120Hz, 12GB RAM, cámara de 50MP con OIS, batería de 5000mAh y carga turbo de 33W.',
        299,399,['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],'smartphones','Motorola','Moto G84',25,true,4.6,178,203,ts),

      P('xiaomi-redmi-note-13-pro','Xiaomi Redmi Note 13 Pro 256GB',
        'Gama media premium con pantalla AMOLED curva de 6.67" 200Hz, procesador Snapdragon 7s Gen 2, cámara triple de 200MP y batería de 5100mAh con carga de 67W.',
        249,329,['https://images.unsplash.com/photo-1598327105854-5a2c2b7f2e2a?w=600'],'smartphones','Xiaomi','Redmi Note 13 Pro',30,true,4.5,234,178,ts),

      P('macbook-pro-m3-14','MacBook Pro M3 14" 512GB',
        'La laptop más potente de Apple. Chip M3 Pro, pantalla Liquid Retina XDR ProMotion 120Hz, hasta 22 horas de batería, 16GB RAM unificada. Puerto HDMI, SD card y USB-C Thunderbolt 4.',
        1999,2299,['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600','https://images.unsplash.com/photo-1611186871525-6de1e12c3cba?w=600'],'laptops','Apple','MacBook Pro M3',5,true,4.9,345,42,ts),

      P('dell-latitude-5540','Dell Latitude 5540 Core i7 16GB',
        'Laptop empresarial Dell con Intel Core i7-1365U, 16GB DDR4, 512GB SSD NVMe, pantalla FHD IPS de 15.6", lector de huella digital y TPM 2.0. Windows 11 Pro.',
        999,1299,['https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600'],'laptops','Dell','Latitude 5540',7,true,4.7,89,31,ts),

      P('lenovo-thinkpad-x1-carbon','Lenovo ThinkPad X1 Carbon Gen 11',
        'La laptop más liviana y resistente del mercado. 1.12 kg, Intel Core i7-1365U, 16GB LPDDR5, 512GB NVMe, pantalla IPS 2K de 14" antiglare. Teclado retroiluminado y 4G LTE.',
        1599,1899,['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600'],'laptops','Lenovo','ThinkPad X1 Carbon',4,true,4.8,167,23,ts),

      P('sony-bravia-65-oled','Sony BRAVIA XR 65" OLED 4K',
        'Televisor OLED de 65 pulgadas con procesador Cognitive XR, Dolby Vision, Dolby Atmos, Google TV, compatible con PS5 Game Mode (4K/120fps VRR ALLM). Bocinas Acoustic Surface Audio.',
        2299,2799,['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600','https://images.unsplash.com/photo-1571415060716-baff5ea4c8d0?w=600'],'televisores','Sony','BRAVIA XR A80L',3,true,4.9,156,18,ts),

      P('samsung-qled-55','Samsung QLED 55" 4K Neo',
        'Televisor Samsung Neo QLED de 55" con procesador Neo Quantum 4K, Mini LED, Quantum HDR 32X, 144Hz para Gaming Hub y pantalla antireflejo. Compatible con Alexa y Google Assistant.',
        899,1199,['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600'],'televisores','Samsung','QN55QN85CAGCZB',8,true,4.7,203,67,ts),

      P('ps5-slim-disc','PlayStation 5 Slim con Lectora',
        'Nueva PlayStation 5 Slim con lectora de discos, 1TB SSD, DualSense wireless controller, retrocompatibilidad con miles de juegos PS4. 3D Audio. Resolución hasta 8K.',
        599,699,['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600','https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600'],'gaming','Sony','PS5 Slim',6,true,4.9,834,145,ts),

      P('xbox-series-x-1tb','Xbox Series X 1TB + 3 meses Game Pass',
        'Consola Xbox Series X con 1TB SSD, 4K gaming hasta 120fps, Quick Resume, retrocompatibilidad. Incluye 3 meses de Xbox Game Pass Ultimate con más de 100 juegos.',
        549,649,['https://images.unsplash.com/photo-1621259182978-fbf4929d1ce5?w=600'],'gaming','Microsoft','Xbox Series X',9,true,4.8,512,98,ts),

      P('nintendo-switch-oled','Nintendo Switch OLED Blanca',
        'Consola Nintendo Switch con pantalla OLED de 7 pulgadas, base con puerto LAN, Joy-Con blancos, 64GB almacenamiento interno. Jugá en TV, sobremesa o modo portátil.',
        349,399,['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600'],'gaming','Nintendo','Switch OLED',15,true,4.8,689,234,ts),

      P('sony-wh1000xm5','Sony WH-1000XM5 Auriculares NC',
        'Los mejores auriculares inalámbricos del mercado. Cancelación de ruido líder, 30 horas de batería, multipoint Bluetooth 5.2, audio 360 Reality y llamadas con 8 micrófonos.',
        349,449,['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600','https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'],'audio','Sony','WH-1000XM5',22,true,4.9,567,312,ts),

      P('airpods-pro-2','Apple AirPods Pro 2da Gen',
        'AirPods Pro con cancelación activa de ruido de nueva generación, audio espacial personalizado con Dynamic Head Tracking, modo Transparencia adaptativo y estuche MagSafe USB-C.',
        279,329,['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'],'audio','Apple','AirPods Pro 2',28,true,4.8,678,289,ts),

      P('ipad-pro-m4-11','iPad Pro M4 11" 256GB Wi-Fi',
        'iPad Pro con el revolucionario chip M4, pantalla Ultra Retina XDR con OLED en tándem, cuerpo de solo 5.1mm de grosor, Apple Pencil Pro compatible y Magic Keyboard con trackpad.',
        1099,1299,['https://images.unsplash.com/photo-1544244015-0df4592c0c41?w=600','https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600'],'tablets','Apple','iPad Pro M4 11"',7,true,4.9,234,56,ts),

      P('canon-eos-r6-mark-ii','Canon EOS R6 Mark II Body',
        'Cámara mirrorless full-frame con sensor CMOS de 24.2MP, DIGIC X, 40fps en ráfaga electrónica, video 6K RAW, IBIS 8 pasos, dual pixel CMOS AF II con seguimiento de sujetos mejorado.',
        2499,2799,['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600','https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=600'],'camaras','Canon','EOS R6 Mark II',3,true,4.9,89,11,ts),

      P('lg-monitor-gaming-27','LG UltraGear 27" QHD 165Hz',
        'Monitor gaming 27 pulgadas con panel Nano IPS QHD 2560x1440, 165Hz, 1ms GtG, NVIDIA G-Sync Compatible, AMD FreeSync Premium Pro, 2xHDMI, 1xDP, HDR600.',
        449,599,['https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600'],'laptops','LG','27GP850P-B',11,true,4.7,178,89,ts),

      // ── ModaBA ──
      P('nike-air-max-270-react','Nike Air Max 270 React',
        'Zapatillas Nike Air Max 270 React con unidad Air más grande de la historia en el talón, espuma React ultra suave y responsiva. Upper de malla ingeniería textil. Tallas 36-46.',
        159,199,['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600','https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600'],'calzado','Nike','Air Max 270 React',35,false,4.7,1023,567,mb),

      P('adidas-ultraboost-23','Adidas Ultraboost 23',
        'Las mejores zapatillas running de Adidas. Entresuela Boost de 6.000 cápsulas, tejido Primeknit adaptativo, placa de fibra de carbono TORSIONBAR y outsole Continental. Tallas 36-47.',
        189,249,['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],'calzado','Adidas','Ultraboost 23',28,false,4.8,789,423,mb),

      P('converse-chuck-taylor-all-star','Converse Chuck Taylor All Star',
        'El clásico de todos los tiempos. Lona de algodón duradero, suela de goma vulcanizada, plantilla OrthoLite acolchada. Disponible en más de 10 colores. Tallas 36-46.',
        79,99,['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],'calzado','Converse','Chuck Taylor All Star',50,false,4.5,2341,1456,mb),

      P('levis-501-jeans-original','Levi\'s 501 Original Jeans',
        'El jean más icónico del mundo. Denim 100% algodón, cinco bolsillos originales, botones de metal. Corte recto clásico. Disponible en azul oscuro, claro y negro. Tallas 28-40.',
        89,119,['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600','https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600'],'ropa','Levi\'s','501 Original',40,false,4.6,1567,892,mb),

      P('adidas-trefoil-hoodie','Adidas Originals Hoodie Trefoil',
        'Buzo con capucha Adidas Originals en algodón fleece con tecnología ECOVERO, logo Trefoil bordado, bolsillo canguro y puños acanalados. Disponible en S-XXL.',
        79,99,['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600'],'ropa','Adidas','Originals Trefoil Hoodie',35,false,4.5,678,334,mb),

      P('polo-lacoste-clasico','Polo Lacoste L.12.12 Clásica',
        'La polo más reconocida del mundo. Confeccionada en petit piqué de algodón 100% con bordado del cocodrilo. Corte semifit, cuello con tres botones. 12 colores disponibles.',
        99,129,['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600'],'ropa','Lacoste','L.12.12',20,false,4.7,456,267,mb),

      P('zara-vestido-midi','Zara Vestido Midi Satinado',
        'Vestido midi con escote en V, cuerpo con drapeado, manga corta ligeramente abullonada y falda con abertura delantera. Tejido con efecto satinado. Tallas XS-XL.',
        69,89,['https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600'],'ropa','Zara','Midi Dress Collection',25,false,4.4,345,189,mb),

      P('ray-ban-aviador-gold','Ray-Ban Aviador Clásico Dorado',
        'Las gafas de sol más icónicas. Montura dorada, lentes en cristal G-15, bisagras de cable. Protección UV400, lentes con tratamiento antireflejo. Incluye estuche y gamuza.',
        159,199,['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'],'ropa','Ray-Ban','RB3025 Aviator Classic',15,false,4.8,892,456,mb),

      // ── CasaHogar ──
      P('sillon-nordico-reclinable','Sillón Nórdico Reclinable Premium',
        'Sillón de diseño escandinavo con estructura en madera de pino sólido, tapizado en tela chenille premium, mecanismo de reclinado y reposapiés integrado. Medidas: 85x95x105cm.',
        599,799,['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600'],'hogar','HomeNord','Relax Premium',6,false,4.5,123,45,ch),

      P('mesa-comedor-extensible','Mesa de Comedor Extensible 6-10 personas',
        'Mesa de comedor extensible de MDF lacado blanco mate y patas de acero inoxidable. Se extiende de 160cm a 240cm. Capacidad 6-10 personas. Incluye guía de extensión de acero.',
        849,1099,['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],'hogar','Nórdica','Mesa Extensible Pro',3,false,4.6,78,28,ch),

      P('lavarropas-whirlpool-10kg','Lavarropas Whirlpool 10kg FreshCare',
        'Lavarropas de carga frontal Whirlpool con tecnología FreshCare+, 16 programas de lavado, 1400rpm, eficiencia energética A+++, tambor de 58L y Carga de 6th Sense. Con pedestal.',
        699,899,['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],'electrodomesticos','Whirlpool','WFW560CHW',5,false,4.7,156,67,ch),

      P('heladera-no-frost-lg','Heladera No Frost LG Side by Side 647L',
        'Heladera Side by Side LG con Compresor Linear Inverter, capacidad total 647L (420F+227C), Door-in-Door, Smart Cooling+, InstaView™, dispensador de agua/hielo. Clase A++.',
        1299,1699,['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'],'electrodomesticos','LG','LRSOS2706S',4,false,4.8,89,32,ch),

      P('microondas-samsung-32l','Microondas Samsung 32L con Grill',
        'Microondas Samsung 32 litros con grill, función Steam, tecnología Ceramic Enamel en el interior, 1000W de potencia, 6 funciones automáticas y plato giratorio de 31.8cm.',
        179,229,['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600'],'electrodomesticos','Samsung','MS32DG4504AW',12,false,4.6,234,145,ch),

      P('aire-acondicionado-split-3000','Aire Acondicionado Split Frío/Calor 3000W',
        'Split inverter Carrier de 3000 frigorías/calor, con función Auto Restart, filtro PM 2.5, control Wi-Fi, consumo A++, nivel de ruido 20dB. Incluye instalación en AMBA.',
        649,849,['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],'electrodomesticos','Carrier','X-Power Split 3000',8,false,4.7,167,89,ch),

      P('cama-sommier-queen-200','Cama Sommier Queen 200x160 Premium',
        'Sommier doble resorte Queen con espuma viscoelástica + HR, 200x160cm, altura total 52cm, tapizado en tela antimite tratada, bordes reforzados con cinta de borde.',
        1099,1499,['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'],'hogar','Piero','Sommier Premium',4,false,4.6,89,23,ch),

      P('cocina-zanussi-6-hornallas','Cocina a Gas Zanussi 6 hornallas',
        'Cocina de 6 hornallas con horno multifunction de 74L, parrilla grill, manija inox, mesada de vidrio templado, encendido electrónico y luz interior. Color blanco.',
        599,799,['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'],'electrodomesticos','Zanussi','ZCG66246BA',6,false,4.5,123,56,ch),

      // ── DeportesPlus ──
      P('pelota-adidas-champions','Pelota Fútbol Adidas Champions League',
        'Pelota oficial UEFA Champions League. Cámara de butilo de alta calidad, cubierta de poliuretano termoseleccionado con textura de líneas. Talla 5. Aprobada FIFA Quality Pro.',
        79,99,['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600','https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600'],'deportes','Adidas','Finale UCL',30,false,4.8,456,312,dp),

      P('bicicleta-montaña-slp','Bicicleta Mountain Bike SLP Hardtail 29"',
        'MTB hardtail 29 pulgadas con cuadro de aluminio 6061, suspensión delantera de 100mm, 21 velocidades Shimano Tourney, frenos hidráulicos Tektro, llantas de doble pared.',
        599,799,['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600','https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600'],'deportes','SLP','Honky 29',7,false,4.6,234,89,dp),

      P('colchoneta-yoga-6mm','Colchoneta Yoga Premium TPE 6mm',
        'Mat de yoga ecológico en TPE sin PVC, 183x61cm, grosor 6mm, antideslizante doble cara, correa de transporte incluida. Apilable y fácil de limpiar. 12 colores disponibles.',
        49,69,['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'],'deportes','YogaFlow','Pro TPE 6mm',45,false,4.7,567,345,dp),

      P('mancuernas-ajustables-20kg','Set Mancuernas Ajustables 2x20kg',
        'Set de 2 mancuernas ajustables de 5 a 20kg cada una. Sistema de selector de peso con disco giratorio, estructura compacta de acero. Incluye soporte. Equivale a 15 pares de mancuernas.',
        299,399,['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],'deportes','SportPro','Flex 20',12,false,4.8,289,145,dp),

      P('zapatillas-running-asics','ASICS Gel-Nimbus 25',
        'Zapatillas de running ASICS con amortiguación GEL en talón y antepié, plataforma FF BLAST+ ECHO, technology GUIDESOLE y upper OrthoLite X-30. Peso: 290g. Drop 10mm.',
        149,189,['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],'calzado','ASICS','Gel-Nimbus 25',25,false,4.7,456,234,dp),

      P('campera-north-face-puffer','The North Face 700 Down Puffer',
        'Campera de plumas 700-fill con exterior 100% reciclado, aislación calor, bolsillos con cierre, capucha removible y empacable en su propio bolsillo. Rango de temperatura: -10°C.',
        229,299,['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600'],'ropa','The North Face','Puffer 700',18,false,4.8,345,189,dp),

      P('casco-bici-urban','Casco Bicicleta Urban Trek Commuter',
        'Casco ciclismo urbano con certificación CPSC/CE EN1078, sistema MIPS, 17 ventilaciones, luz trasera integrada, visor ajustable. Tallas: S (51-55cm), M (55-59cm), L (59-63cm).',
        89,119,['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],'deportes','Trek','Commuter MIPS',20,false,4.6,167,89,dp),

      // ── AgroSimple ──
      P('tractor-pauny-280','Tractor PAUNY 280 CV 4x4',
        'Tractor nacional PAUNY modelo EVO 280 de 280CV, 4x4 con bloqueo diferencial trasero, transmisión Powershift de 16 marchas adelante y 4 atrás, cabina con aire acondicionado y GPS.',
        85000,95000,['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],'agro','PAUNY','EVO 280 4x4',2,false,4.9,23,4,ag),

      P('semillas-soja-tolerante','Semillas Soja RR Tolerante Glifosato 50kg',
        'Bolsa de 50kg de semillas de soja Roundup Ready de primer ciclo, tratada con fungicidas + insecticidas + rizobio. Pureza 98%, germinación 85%. Origen: INTA Marcos Juárez.',
        89,99,['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],'agro','INTA','Soja RR50',200,false,4.7,45,156,ag),

      P('herbicida-glifosato-20l','Glifosato 48% SL 20 litros',
        'Herbicida glifosato 48% SL de máxima calidad, formulación líquida concentrada, control de malezas anuales y perennes. Apto para uso agrícola, forestal y barbecho. SENASA aprobado.',
        49,69,['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],'agro','AgroQuím','Glifosato 48%',500,false,4.6,89,234,ag),

      P('mochila-fumigadora-20l','Mochila Fumigadora a Motor 20L',
        'Mochila fumigadora motorizada 20 litros con motor 2 tiempos, boquilla ajustable, manguerote de 1.5m, correas acolchadas antifatiga. Alcance de fumigación: 8-10m.',
        149,199,['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],'agro','Solo','Mochila 423',35,false,4.5,67,89,ag),

      P('alimento-bovino-pellets','Alimento Balanceado Bovino Pellets 40kg',
        'Balanceado para ganado bovino de carne en etapa de terminación. 16% proteína, energía 72% TND, vitaminas ADE y minerales. Bolsa de 40kg. Apto para feed-lot.',
        29,35,['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],'agro','Nutriva','Feedlot Pro',1000,false,4.4,34,567,ag),

      P('molino-harinero-domestico','Molino Harinero Doméstico 300W',
        'Molino de granos eléctrico 300W para uso doméstico. Muele trigo, maíz, arroz, soja y especias. Capacidad: 500g por ciclo, 3 regulaciones de grosor, acero inoxidable grado alimentario.',
        199,249,['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],'agro','GrainMill','Doméstico 300',15,false,4.3,28,17,ag),
    ];

    const created: Product[] = [];
    for (const p of products) {
      const exists = await this.productRepo.findOne({ where: { slug: p.slug } });
      if (!exists) {
        const { categorySlug, ...data } = p as any;
        const cat = cats[categorySlug];
        const product = (await this.productRepo.save(this.productRepo.create({
          ...data,
          categoryId: cat?.id,
          status: ProductStatus.ACTIVE,
        }))) as unknown as Product;
        created.push(product);
        console.log(`  ✓ [${categorySlug?.padEnd(16)}] ${p.title}`);
      } else {
        created.push(exists);
        console.log(`  → Existe: ${p.title}`);
      }
    }
    return created;
  }

  // ─────────────────────────────────────────────────────────────
  // REVIEWS — reseñas variadas
  // ─────────────────────────────────────────────────────────────
  private async seedReviews(users: Record<string, User>, products: Product[]) {
    console.log('\n⭐ Creando reseñas...');
    const reviewers = [
      users['comprador@mercadosimple.com'],
      users['maria.garcia@gmail.com'],
      users['carlos.lopez@gmail.com'],
      users['ana.fernandez@gmail.com'],
    ].filter(Boolean);

    const templates = [
      { rating: 5, title: '¡Excelente!', comment: 'Superó todas mis expectativas. Producto de primera calidad, llegó perfecto y antes de lo prometido. El vendedor responde muy rápido. 100% recomendable.' },
      { rating: 5, title: 'Perfecto', comment: 'Exactamente lo que necesitaba. El embalaje es impecable y el producto funciona a la perfección. Haría otra compra sin dudar.' },
      { rating: 4, title: 'Muy bueno', comment: 'Muy buen producto, tal como se describe. La entrega fue rápida. Solo el embalaje podría mejorar un poco. Vendedor muy atento.' },
      { rating: 4, title: 'Recomendable', comment: 'Buena relación calidad-precio. El producto es tal como se muestra en las fotos. Llegaría a comprarle nuevamente a este vendedor.' },
      { rating: 5, title: 'Llegó antes de lo prometido', comment: 'Sorprendentemente rápido. El producto en condiciones inmejorables. Exactamente como en la descripción.' },
      { rating: 3, title: 'Bien, pero con demoras', comment: 'El producto está bien, cumple su función. Tardó más de lo indicado en llegar pero al final llegó bien.' },
      { rating: 5, title: 'Top calidad', comment: 'Un lujo de producto. Vale cada centavo. El vendedor es muy profesional y confiable. Ya estoy buscando mi próxima compra.' },
    ];

    let count = 0;
    for (let i = 0; i < Math.min(products.length, 30); i++) {
      const reviewer = reviewers[i % reviewers.length];
      if (!reviewer) continue;
      const exists = await this.reviewRepo.findOne({ where: { productId: products[i].id, reviewerId: reviewer.id } });
      if (!exists && products[i].sellerId !== reviewer.id) {
        const t = templates[i % templates.length];
        await this.reviewRepo.save(this.reviewRepo.create({
          ...t,
          reviewerId: reviewer.id,
          productId: products[i].id,
          sellerId: products[i].sellerId,
        }));
        count++;
      }
    }
    console.log(`  ✓ ${count} reseñas creadas`);
  }

  // ─────────────────────────────────────────────────────────────
  // QUESTIONS — preguntas y respuestas en productos
  // ─────────────────────────────────────────────────────────────
  private async seedQuestions(users: Record<string, User>, products: Product[]) {
    console.log('\n❓ Creando preguntas y respuestas...');
    const buyers = [
      users['comprador@mercadosimple.com'],
      users['maria.garcia@gmail.com'],
      users['carlos.lopez@gmail.com'],
    ].filter(Boolean);

    const qas = [
      { q: '¿Tiene garantía oficial? ¿De cuánto tiempo?', a: 'Sí, tiene garantía oficial de 12 meses. Ante cualquier problema te guiamos en el proceso.' },
      { q: '¿Hacen envíos al interior del país?', a: '¡Sí! Enviamos a todo el país por Correo Argentino, OCA o Andreani. El flete lo cotizamos según tu código postal.' },
      { q: '¿Tiene stock disponible? ¿Cuántos días demora el envío?', a: 'Sí, hay stock disponible. El envío demora entre 3 y 7 días hábiles según tu ubicación.' },
      { q: '¿Es original o réplica?', a: '100% original con caja sellada de fábrica. Emitimos factura en todos nuestros productos.' },
      { q: '¿Puedo pagar en cuotas?', a: 'Sí, podés pagar en cuotas con tarjeta de crédito desde la plataforma.' },
      { q: '¿El precio incluye IVA?', a: 'Sí, todos nuestros precios ya incluyen IVA. No hay costos ocultos.' },
      { q: '¿Puedo retirar en persona?', a: 'Por el momento solo realizamos envíos. Estamos trabajando para habilitar retiro en tienda pronto.' },
      { q: 'Necesito factura ¿emiten?', a: 'Sí, emitimos factura A o B según corresponda. Pedila al momento de la compra.' },
    ];

    let count = 0;
    for (let i = 0; i < Math.min(products.length, 20); i++) {
      const buyer = buyers[i % buyers.length];
      if (!buyer) continue;
      const qa = qas[i % qas.length];
      const exists = await this.questionRepo.findOne({ where: { productId: products[i].id, askerId: buyer.id } });
      if (!exists && products[i].sellerId !== buyer.id) {
        await this.questionRepo.save(this.questionRepo.create({
          productId: products[i].id,
          askerId: buyer.id,
          question: qa.q,
          answer: qa.a,
          status: QuestionStatus.ANSWERED,
          answeredAt: new Date(),
          isPublic: true,
        }));
        count++;
      }
    }
    // Also create a few unanswered questions
    for (let i = 20; i < Math.min(products.length, 25); i++) {
      const buyer = buyers[i % buyers.length];
      if (!buyer) continue;
      const exists = await this.questionRepo.findOne({ where: { productId: products[i].id, askerId: buyer.id } });
      if (!exists && products[i].sellerId !== buyer.id) {
        await this.questionRepo.save(this.questionRepo.create({
          productId: products[i].id,
          askerId: buyer.id,
          question: '¿Tienen más colores disponibles además de los que se muestran?',
          status: QuestionStatus.UNANSWERED,
          isPublic: false,
        }));
        count++;
      }
    }
    console.log(`  ✓ ${count} preguntas creadas`);
  }

  // ─────────────────────────────────────────────────────────────
  // WALLETS — con saldos reales y transacciones de ejemplo
  // ─────────────────────────────────────────────────────────────
  private async seedWallets(users: Record<string, User>) {
    console.log('\n💳 Creando billeteras y saldos...');
    const balances: Record<string, number> = {
      'admin@mercadosimple.com':          100000,
      'techstore@mercadosimple.com':       75000,
      'modaba@mercadosimple.com':          42000,
      'casahogar@mercadosimple.com':       28000,
      'deportesplus@mercadosimple.com':    35000,
      'agrosimple@mercadosimple.com':      15000,
      'comprador@mercadosimple.com':       15000,
      'maria.garcia@gmail.com':            8500,
      'carlos.lopez@gmail.com':            12000,
      'ana.fernandez@gmail.com':           5000,
      'pedro.martinez@gmail.com':          3000,
    };

    let i = 1;
    for (const [email, balance] of Object.entries(balances)) {
      const user = users[email];
      if (!user?.id) { i++; continue; }

      let wallet = await this.walletRepo.findOne({ where: { userId: user.id } });
      if (!wallet) {
        wallet = await this.walletRepo.save(this.walletRepo.create({
          userId: user.id,
          balance,
          cvu: makeCVU(1000000 + i),
          alias: makeAlias(['PAGO', 'SIMPLE', String(i).padStart(4, '0')]),
          accountNumber: makeAccountNumber(i),
          isActive: true,
          isFrozen: false,
        }));

        await this.walletTxRepo.save(this.walletTxRepo.create({
          walletId: wallet.id,
          type: WalletTransactionType.DEPOSIT,
          status: WalletTransactionStatus.COMPLETED,
          amount: balance,
          balanceAfter: balance,
          description: 'Saldo inicial de bienvenida — Mercado Simple',
          metadata: { paymentMethod: 'initial', seed: true },
        }));

        console.log(`  ✓ Billetera ${wallet.accountNumber} | ${wallet.alias} | Saldo: $${balance.toLocaleString()}`);
      } else {
        // Update CVU/alias if missing
        if (!wallet.cvu || wallet.cvu === '') {
          await this.walletRepo.update(wallet.id, {
            cvu: makeCVU(1000000 + i),
            alias: makeAlias(['PAGO', 'SIMPLE', String(i).padStart(4, '0')]),
            accountNumber: makeAccountNumber(i),
          });
        }
        console.log(`  → Billetera existente: ${email}`);
      }
      i++;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // NOTIFICACIONES — para mostrar el sistema activo
  // ─────────────────────────────────────────────────────────────
  private async seedNotifications(users: Record<string, User>) {
    console.log('\n🔔 Creando notificaciones de bienvenida...');
    const msgs = [
      { title: '¡Bienvenido a Mercado Simple! 🎉', body: 'Tu cuenta está lista. Empezá a comprar y vender con total seguridad. Explorá las ofertas del día.' },
      { title: '⚡ Tu cuenta Pago Simple está activa', body: 'Tu billetera digital está lista. Podés cargar saldo, transferir dinero y pagar servicios desde tu cuenta.' },
      { title: '🛡️ Cuenta verificada', body: 'Tu identidad fue verificada correctamente. Disfrutá de todos los beneficios de ser usuario verificado en Mercado Simple.' },
    ];

    let count = 0;
    for (const user of Object.values(users)) {
      if (!user?.id) continue;
      const exists = await this.notifRepo.findOne({ where: { userId: user.id } });
      if (!exists) {
        for (const msg of msgs) {
          await this.notifRepo.save(this.notifRepo.create({
            userId: user.id,
            title: msg.title,
            body: msg.body,
            type: NotificationType.SYSTEM,
            isRead: false,
          }));
          count++;
        }
      }
    }
    console.log(`  ✓ ${count} notificaciones creadas`);
  }
}
