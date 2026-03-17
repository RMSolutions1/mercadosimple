'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Zap, Shield, Truck, Star, TrendingUp, ArrowRight,
  ChevronLeft, Percent, Tag, Clock, Gift, Award, CreditCard, Headphones,
} from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Product, Category } from '@/types';
import api from '@/lib/axios';

const CATEGORIES = [
  { name: 'Tecnología', slug: 'tecnologia', emoji: '💻', color: 'from-[#2E6DA8] to-[#4A8AC4]', icon: '🖥️' },
  { name: 'Smartphones', slug: 'smartphones', emoji: '📱', color: 'from-gray-700 to-gray-800', icon: '📲' },
  { name: 'Electrodomésticos', slug: 'electrodomesticos', emoji: '🏠', color: 'from-[#007140] to-[#00A65A]', icon: '🧺' },
  { name: 'Moda', slug: 'moda', emoji: '👗', color: 'from-pink-500 to-rose-600', icon: '👠' },
  { name: 'Deportes', slug: 'deportes', emoji: '⚽', color: 'from-orange-500 to-orange-600', icon: '🏃' },
  { name: 'Hogar', slug: 'hogar', emoji: '🛋️', color: 'from-amber-600 to-amber-700', icon: '🏡' },
  { name: 'Gaming', slug: 'gaming', emoji: '🎮', color: 'from-purple-600 to-purple-700', icon: '🕹️' },
  { name: 'Autos y Motos', slug: 'vehiculos', emoji: '🚗', color: 'from-red-600 to-red-700', icon: '🚘' },
  { name: '🌾 Campo y Agro', slug: 'agro', emoji: '🚜', color: 'from-[#4A7C2B] to-[#6B8F3A]', icon: '🌾' },
  { name: '⛏️ Minería', slug: 'industria', emoji: '⚙️', color: 'from-[#5A4A3A] to-[#7A6652]', icon: '⛏️' },
  { name: '🛢️ Industrial', slug: 'industria', emoji: '🏭', color: 'from-[#2C4A6B] to-[#3A6080]', icon: '🏭' },
  { name: 'Bebés', slug: 'bebes', emoji: '👶', color: 'from-yellow-400 to-yellow-500', icon: '🍼' },
  { name: 'Belleza', slug: 'belleza', emoji: '💄', color: 'from-rose-500 to-rose-600', icon: '✨' },
  { name: 'Libros', slug: 'libros', emoji: '📚', color: 'from-teal-600 to-teal-700', icon: '📖' },
  { name: 'Inmuebles', slug: 'inmuebles', emoji: '🏢', color: 'from-indigo-600 to-indigo-700', icon: '🏘️' },
  { name: 'Ver todo', slug: 'productos', emoji: '🔍', color: 'from-[#74ACDF] to-[#4A8AC4]', icon: '➕' },
];

const HERO_BANNERS = [
  {
    id: 1,
    title: '🇦🇷 Hecho en Argentina',
    subtitle: 'El marketplace de los argentinos',
    description: 'Comprá y vendé con total seguridad. Millones de productos con envío a todo el país.',
    cta: 'Explorar ahora',
    ctaLink: '/productos',
    gradient: 'from-[#1E3A5F] via-[#2E6DA8] to-[#74ACDF]',
    badge: '⚡ OFERTAS HOY',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
    argTheme: true,
  },
  {
    id: 2,
    title: 'Ofertas del Día',
    subtitle: 'Hasta 60% OFF en tecnología',
    description: 'Los mejores precios en smartphones, notebooks, TVs y más',
    cta: 'Ver ofertas',
    ctaLink: '/ofertas',
    gradient: 'from-[#1E3A5F] via-[#2E6DA8] to-[#4A8AC4]',
    badge: '🔥 LIMITADO',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
  },
  {
    id: 3,
    title: 'Campo Argentino',
    subtitle: 'Todo para el agro y la industria',
    description: 'Maquinaria, herramientas, insumos agrícolas y más con envío nacional',
    cta: 'Ver categoría',
    ctaLink: '/categorias/agro',
    gradient: 'from-[#2D5A1B] via-[#4A7C2B] to-[#6B8F3A]',
    badge: '🌾 AGRO',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
  },
  {
    id: 4,
    title: 'Pago Simple',
    subtitle: 'Tu plata, más rendimiento',
    description: 'Transferí, pagá servicios, cargá la SUBE y administrá tu dinero con total seguridad',
    cta: 'Ir a Pago Simple',
    ctaLink: '/mi-cuenta?tab=billetera',
    gradient: 'from-[#1A3A2A] via-[#007140] to-[#00A65A]',
    badge: '⚡ PAGO SIMPLE',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
  },
];

const BENEFITS = [
  { icon: Truck, label: 'Envío a todo el país', desc: 'Gratis en miles de productos', color: 'text-arg-verde' },
  { icon: Shield, label: 'Compra Protegida', desc: 'Tu dinero seguro hasta recibirlo', color: 'text-arg-celeste-dark' },
  { icon: CreditCard, label: 'Hasta 12 cuotas', desc: 'Sin interés con tarjeta 🇦🇷', color: 'text-purple-600' },
  { icon: Headphones, label: 'Soporte argentino', desc: 'Atención 24/7 en español', color: 'text-arg-sol-dark' },
];

const BRANDS = [
  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', slug: 'apple' },
  { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', slug: 'samsung' },
  { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', slug: 'sony' },
  { name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/LG_symbol.svg', slug: 'lg' },
  { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', slug: 'nike' },
  { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', slug: 'adidas' },
];

function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = targetTime.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((val, i) => (
        <span key={i} className="flex items-center">
          <span className="bg-ms-yellow text-gray-900 font-bold text-sm px-1.5 py-0.5 rounded min-w-[28px] text-center">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-ms-yellow font-bold mx-0.5">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, catsRes] = await Promise.all([
          api.get('/products/featured').catch(() => ({ data: { products: [] } })),
          api.get('/products?sortBy=newest&limit=8').catch(() => ({ data: { products: [] } })),
          api.get('/categories').catch(() => ({ data: [] })),
        ]);
        setFeaturedProducts(featuredRes.data?.products || featuredRes.data || []);
        setNewProducts(newRes.data?.products || newRes.data || []);
        setCategories(catsRes.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveSlide((s) => (s + 1) % HERO_BANNERS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const banner = HERO_BANNERS[activeSlide];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO BANNER */}
      <section className={`bg-gradient-to-r ${banner.gradient} text-white overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                {banner.badge}
              </span>
              <h1 className="text-3xl md:text-5xl font-black leading-tight">{banner.title}</h1>
              <p className="text-xl md:text-3xl font-bold text-white/90">{banner.subtitle}</p>
              <p className="text-white/80 max-w-md">{banner.description}</p>
              <Link
                href={banner.ctaLink}
                className="inline-flex items-center gap-2 bg-ms-yellow text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {banner.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="w-full md:w-96 h-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {HERO_BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all ${i === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS BAR */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${b.color}`}>
                  <b.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.label}</p>
                  <p className="text-gray-500 text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTAS DEL DÍA */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-ms-blue text-white px-3 py-1.5 rounded-lg">
              <Zap className="w-4 h-4" />
              <span className="font-bold text-sm">OFERTAS DEL DÍA</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Terminan en:</span>
              <CountdownTimer targetTime={todayEnd} />
            </div>
          </div>
          <Link href="/ofertas" className="flex items-center gap-1 text-ms-blue font-semibold text-sm hover:underline">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="bg-gray-200 rounded-lg h-40 mb-3" />
                <div className="bg-gray-200 h-3 rounded mb-2" />
                <div className="bg-gray-200 h-5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredProducts.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} showDiscount />
            ))}
          </div>
        )}
      </section>

      {/* BANNER PAGO SIMPLE */}
      <section className="max-w-7xl mx-auto px-4 py-2">
        <div className="rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #0891B2 100%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⚡</span>
              <h2 className="text-2xl font-black" style={{ fontFamily: 'Raleway, sans-serif' }}>Pago Simple</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30">Sistema de pagos de Mercado Simple</span>
            </div>
            <p className="text-white/80 text-sm">Transferí, pagá servicios, recargá la SUBE y administrá tu dinero — todo desde un solo lugar.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/mi-cuenta?tab=billetera" className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition text-center text-sm">
              Ir a Pago Simple
            </Link>
            <Link href="/auth/registro" className="bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-400 transition text-center text-sm border border-white/30">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-ms-blue" /> Comprá por categoría
          </h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categorias/${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 group cursor-pointer"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs text-gray-700 text-center font-medium leading-tight group-hover:text-ms-blue">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ms-blue" /> Productos destacados
          </h2>
          <Link href="/productos" className="flex items-center gap-1 text-ms-blue font-semibold text-sm hover:underline">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-3" />
                <div className="bg-gray-200 h-3 rounded mb-2" />
                <div className="bg-gray-200 h-5 rounded w-3/4 mb-2" />
                <div className="bg-gray-200 h-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* MARCAS OFICIALES */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-ms-blue" /> Tiendas oficiales
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/productos?search=${brand.name}`}
              className="bg-white rounded-xl p-4 flex items-center justify-center hover:shadow-md transition-all hover:-translate-y-0.5 h-16"
            >
              <img src={brand.logo} alt={brand.name} className="max-h-8 max-w-full object-contain grayscale hover:grayscale-0 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* RECIÉN LLEGADOS */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-ms-yellow fill-ms-yellow" /> Recién llegados
            </h2>
            <Link href="/productos?sortBy=newest" className="flex items-center gap-1 text-ms-blue font-semibold text-sm hover:underline">
              Ver más <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* BANNER VENDER */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-12">
        <div className="bg-gradient-to-r from-ms-blue to-blue-700 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-6">
          <div className="text-4xl">🏪</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">¿Tenés algo para vender?</h2>
            <p className="text-white/80">Publicá gratis y llegá a millones de compradores en todo el país.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/como-vender" className="bg-white/20 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition text-sm">
              Cómo vender
            </Link>
            <Link href="/auth/registro?role=seller" className="bg-ms-yellow text-gray-900 font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition text-sm">
              Empezar a vender
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
