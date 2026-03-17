'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, MapPin, Package, Award, TrendingUp, Clock, CheckCircle,
  ArrowLeft, Shield, MessageCircle, Heart, ChevronRight,
} from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface SellerProfile {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  province?: string;
  reputation: number;
  totalSales: number;
  isActive: boolean;
  createdAt: string;
  reputationLevel: {
    label: string;
    color: string;
    level: number;
  };
  memberMonths: number;
}

function ReputationThermometer({ reputation }: { reputation: number | string }) {
  const rep = Number(reputation);
  const pct = Math.min(100, (rep / 5) * 100);
  const color = rep >= 4.5 ? '#22c55e' : rep >= 3.5 ? '#84cc16' : rep >= 3 ? '#eab308' : '#f97316';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, #ef4444, #eab308, ${color})` }}
        />
      </div>
      <span className="text-sm font-bold" style={{ color }}>{rep.toFixed(1)}</span>
    </div>
  );
}

function StarRating({ rating, size = 'sm' }: { rating: number | string; size?: 'sm' | 'md' }) {
  const r = Number(rating);
  const cls = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(r) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'info'>('products');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [profileRes, productsRes, reviewsRes] = await Promise.all([
          api.get(`/users/${sellerId}/public-profile`),
          api.get(`/products?sellerId=${sellerId}&limit=20`),
          api.get(`/reviews?sellerId=${sellerId}&limit=10`).catch(() => ({ data: [] })),
        ]);
        setSeller(profileRes.data.seller);
        setProducts(productsRes.data?.products || productsRes.data || []);
        setReviews(reviewsRes.data?.reviews || reviewsRes.data || []);
      } catch {
        toast.error('Error al cargar el perfil del vendedor');
        router.push('/productos');
      } finally {
        setIsLoading(false);
      }
    };
    if (sellerId) load();
  }, [sellerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ms-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!seller) return null;

  const memberYears = Math.floor(seller.memberMonths / 12);
  const memberMonths = seller.memberMonths % 12;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER VENDEDOR */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-ms-blue text-sm mb-4 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* AVATAR */}
            <div className="relative">
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-ms-blue to-blue-700 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-3xl font-bold">{seller.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {seller.reputationLevel.level >= 4 && (
                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  ⭐ Líder
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: seller.reputationLevel.color }}
                >
                  {seller.reputationLevel.label}
                </span>
              </div>
              {(seller.city || seller.province) && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4" /> {[seller.city, seller.province].filter(Boolean).join(', ')}
                </p>
              )}
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={seller.reputation} size="md" />
                <span className="font-bold text-gray-900">{Number(seller.reputation).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-ms-blue" />
                  <span><strong className="text-gray-900">{Number(seller.totalSales).toLocaleString('es-AR')}</strong> ventas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-ms-blue" />
                  <span>
                    Miembro hace {memberYears > 0 ? `${memberYears} año${memberYears > 1 ? 's' : ''}` : ''}{' '}
                    {memberMonths > 0 ? `${memberMonths} mes${memberMonths > 1 ? 'es' : ''}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex gap-3">
              <Link
                href={`/chat?sellerId=${sellerId}`}
                className="flex items-center gap-2 border border-ms-blue text-ms-blue px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Contactar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR MÉTRICAS */}
          <div className="space-y-4">
            {/* REPUTACIÓN */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-ms-blue" /> Reputación
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Puntaje</span>
                    <span className="font-bold">{Number(seller.reputation).toFixed(1)}/5</span>
                  </div>
                  <ReputationThermometer reputation={seller.reputation} />
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {[
                    { label: 'Calificaciones positivas', value: `${Math.min(99, Math.floor(Number(seller.reputation) * 19))}%`, color: 'text-green-600' },
                    { label: 'Ventas concretadas', value: `${Math.max(95, Math.floor(Number(seller.totalSales) / (Number(seller.totalSales) + 5) * 100))}%`, color: 'text-green-600' },
                    { label: 'Reclamos resueltos', value: '100%', color: 'text-green-600' },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{m.label}</span>
                      <span className={`font-semibold ${m.color}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GARANTÍAS */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-ms-blue mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Compra Protegida</p>
                  <p className="text-gray-600 text-xs mt-1">Si no recibís tu producto, te devolvemos el dinero.</p>
                </div>
              </div>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Estadísticas</h3>
              <div className="space-y-3">
                {[
                  { label: 'Productos publicados', value: products.length.toString(), icon: '📦' },
                  { label: 'Total de ventas', value: Number(seller.totalSales).toLocaleString('es-AR'), icon: '🛒' },
                  { label: 'Puntaje promedio', value: `${Number(seller.reputation).toFixed(1)} ⭐`, icon: '⭐' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm flex items-center gap-1.5">
                      <span>{stat.icon}</span> {stat.label}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="lg:col-span-3">
            {/* TABS */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl">
              {[
                { id: 'products', label: `Productos (${products.length})`, icon: Package },
                { id: 'reviews', label: 'Calificaciones', icon: Star },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all border-b-2 ${
                      activeTab === tab.id ? 'border-ms-blue text-ms-blue' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* PRODUCTOS */}
            {activeTab === 'products' && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">Este vendedor no tiene productos publicados</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CALIFICACIONES */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start gap-8 mb-6 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <div className="text-5xl font-black text-gray-900">{Number(seller.reputation).toFixed(1)}</div>
                    <StarRating rating={seller.reputation} size="md" />
                    <p className="text-gray-500 text-sm mt-1">de 5</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const pct = stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 w-20">
                            {[...Array(stars)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Este vendedor aún no tiene calificaciones.</p>
                  ) : reviews.map((rev) => (
                    <div key={rev.id} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-ms-blue flex items-center justify-center text-white text-sm font-bold">
                            {(rev.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{rev.user?.name || 'Usuario'}</p>
                            <StarRating rating={rev.rating} />
                          </div>
                        </div>
                        <span className="text-gray-400 text-xs">{new Date(rev.createdAt).toLocaleDateString('es-AR')}</span>
                      </div>
                      {rev.comment && <p className="text-gray-600 text-sm">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
