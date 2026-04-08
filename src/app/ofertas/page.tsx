'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Clock, Filter, ChevronDown, Star, Truck, Shield, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';

function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const calc = () => {
      const diff = targetTime.getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setExpired(false);
      setTimeLeft({ hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetTime]);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (expired) {
    return (
      <span className="bg-white/20 text-white font-bold px-4 py-2 rounded-lg text-sm">
        Nuevas ofertas mañana
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((val, i) => (
        <span key={i} className="flex items-center">
          <span className="bg-gray-900 text-white font-bold text-xl px-2 py-1 rounded min-w-[40px] text-center">{pad(val)}</span>
          {i < 2 && <span className="text-gray-900 font-bold mx-1 text-xl">:</span>}
        </span>
      ))}
    </div>
  );
}

const OFFER_CATEGORIES = [
  { id: 'all', label: 'Todas las ofertas', emoji: '🔥' },
  { id: 'tecnologia', label: 'Tecnología', emoji: '💻' },
  { id: 'smartphones', label: 'Smartphones', emoji: '📱' },
  { id: 'electrodomesticos', label: 'Electrodomésticos', emoji: '🏠' },
  { id: 'moda', label: 'Moda', emoji: '👗' },
  { id: 'deportes', label: 'Deportes', emoji: '⚽' },
  { id: 'hogar', label: 'Hogar', emoji: '🛋️' },
];

export default function OfertasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const { addItem } = useCartStore();

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 0);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = { limit: '40', sortBy };
        if (activeCategory !== 'all') params.categorySlug = activeCategory;
        const res = await api.get('/products', { params });
        setProducts(res.data?.products || res.data || []);
      } catch {
        toast.error('Error al cargar ofertas');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeCategory, sortBy]);

  const productsWithDiscount = products
    .filter((p) => p.originalPrice && p.price < p.originalPrice)
    .map((p) => ({
      ...p,
      discountPercent: Math.round((1 - Number(p.price) / Number(p.originalPrice!)) * 100),
      originalPriceDisplay: p.originalPrice!,
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO OFERTAS */}
      <section className="bg-gradient-to-r from-ms-blue to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-6 h-6 fill-ms-yellow text-ms-yellow" />
                <span className="font-black text-3xl">OFERTAS DEL DÍA</span>
              </div>
              <p className="text-white/80 text-lg">Los mejores descuentos, solo por hoy</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Terminan en:
              </p>
              <CountdownTimer targetTime={todayEnd} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6 overflow-x-auto text-sm">
            <div className="flex items-center gap-2 text-green-600 font-semibold whitespace-nowrap">
              <Truck className="w-4 h-4" /> Envío gratis en miles de productos
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold whitespace-nowrap">
              <Shield className="w-4 h-4" /> Compra protegida
            </div>
            <div className="flex items-center gap-2 text-purple-600 font-semibold whitespace-nowrap">
              ⚡ Hasta 60% de descuento
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* CATEGORÍAS FILTER */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {OFFER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-ms-blue text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* SORT & COUNT */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm">
            <span className="font-semibold text-gray-900">{productsWithDiscount.length}</span> ofertas disponibles
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-ms-blue focus:border-transparent"
          >
            <option value="discount">Mayor descuento</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="bestseller">Más vendidos</option>
            <option value="rating">Mejor calificados</option>
          </select>
        </div>

        {/* PRODUCTS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="bg-gray-200 rounded-lg h-44 mb-3" />
                <div className="bg-gray-200 h-3 rounded mb-2" />
                <div className="bg-gray-200 h-5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : productsWithDiscount.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 px-6">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no hay ofertas con descuento</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Explorá todo el catálogo y encontrá los mejores precios. Nuevas ofertas se suman todos los días.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/productos" className="inline-flex items-center justify-center gap-2 bg-ms-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition">
                Ver todos los productos
              </Link>
              <Link href="/" className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition">
                Volver al inicio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productsWithDiscount.map((product) => (
              <Link key={product.id} href={`/productos/${product.id}`} className="block">
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group h-full">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                      alt={product.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white font-bold text-xs px-2 py-1 rounded-full">
                        -{product.discountPercent}%
                      </span>
                    </div>
                    {product.freeShipping && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium">
                          Envío gratis
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-gray-700 text-sm line-clamp-2 mb-2 leading-tight">{product.title}</p>
                    <p className="text-gray-400 text-xs line-through">
                      {formatPrice(product.originalPriceDisplay)}
                    </p>
                    <p className="text-gray-900 font-bold text-lg">{formatPrice(product.price)}</p>
                    <p className="text-green-600 text-xs font-semibold">
                      Ahorrás {formatPrice(product.originalPriceDisplay - product.price)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {product.rating || 4.5} ({product.reviewCount || 0})
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem(product.id, 1);
                        toast.success('Agregado al carrito');
                      }}
                      className="w-full mt-3 bg-ms-blue text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
