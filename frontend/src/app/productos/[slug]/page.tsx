'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Heart, Star, Truck, Shield, MessageCircle,
  ChevronLeft, Check, Package, User, AlertCircle, MapPin,
  ChevronDown, ChevronUp, ZoomIn, Share2, CreditCard, Minus,
  Plus, ExternalLink, CheckCircle, Clock, RotateCcw, Award,
} from 'lucide-react';
import { Product, Review, Question } from '@/types';
import { formatPrice, getDiscount, formatDate, getReputationLabel, getReputationColor } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const INSTALLMENTS = [
  { qty: 1, label: '1 pago', surcharge: 0 },
  { qty: 3, label: '3 cuotas sin interés', surcharge: 0 },
  { qty: 6, label: '6 cuotas sin interés', surcharge: 0 },
  { qty: 12, label: '12 cuotas sin interés', surcharge: 0 },
  { qty: 18, label: '18 cuotas', surcharge: 0.15 },
  { qty: 24, label: '24 cuotas', surcharge: 0.30 },
];

const SHIPPING_COSTS: Record<string, { cost: number; days: string }> = {
  C: { cost: 0, days: 'Llega mañana' },
  B: { cost: 0, days: '2-3 días hábiles' },
  X: { cost: 1500, days: '3-5 días hábiles' },
  S: { cost: 2500, days: '5-7 días hábiles' },
  T: { cost: 3500, days: '7-10 días hábiles' },
};

function getShippingByPostalCode(code: string) {
  const zone = code.charAt(0).toUpperCase();
  return SHIPPING_COSTS[zone] || { cost: 2000, days: '4-7 días hábiles' };
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'questions'>('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const [shipping, setShipping] = useState<{ cost: number; days: string } | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState(0);
  const [showInstallments, setShowInstallments] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/slug/${slug}`);
        setProduct(data);
        if (isAuthenticated) {
          const favRes = await api.get(`/favorites/${data.id}/check`).catch(() => ({ data: { isFavorite: false } }));
          setIsFavorite(favRes.data.isFavorite);
        }
        // Load questions & related
        const [qRes, relRes] = await Promise.all([
          api.get(`/questions/product/${data.id}`).catch(() => ({ data: [] })),
          api.get(`/products?limit=6&categorySlug=${data.category?.slug || ''}`).catch(() => ({ data: { products: [] } })),
        ]);
        setQuestions(qRes.data || []);
        const rel = (relRes.data?.products || relRes.data || []).filter((p: Product) => p.id !== data.id).slice(0, 5);
        setRelatedProducts(rel);
      } catch {
        try {
          const { data } = await api.get(`/products/${slug}`);
          setProduct(data);
        } catch {
          toast.error('Producto no encontrado');
          router.push('/productos');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Debés iniciar sesión'); router.push('/auth/login'); return; }
    if (product) await addItem(product.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (product) { await addItem(product.id, quantity); router.push('/checkout'); }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { toast.error('Debés iniciar sesión'); return; }
    if (!product) return;
    try {
      const { data } = await api.post(`/favorites/${product.id}/toggle`);
      setIsFavorite(data.isFavorite);
      toast.success(data.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    } catch { toast.error('Error al actualizar favoritos'); }
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (!product) return;
    try {
      const { data } = await api.post('/chat/conversations', { sellerId: product.seller.id, productId: product.id });
      router.push(`/chat?conversationId=${data.id}`);
    } catch { toast.error('Error al iniciar conversación'); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !product) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { ...reviewForm, productId: product.id });
      toast.success('Reseña enviada');
      const { data } = await api.get(`/products/${product.id}`);
      setProduct(data);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error al enviar reseña'); }
    finally { setSubmittingReview(false); }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Debés iniciar sesión para preguntar'); router.push('/auth/login'); return; }
    if (!product || !newQuestion.trim()) return;
    setSubmittingQuestion(true);
    try {
      await api.post('/questions', { productId: product.id, question: newQuestion });
      toast.success('Pregunta enviada al vendedor');
      setNewQuestion('');
      const qRes = await api.get(`/questions/product/${product.id}`);
      setQuestions(qRes.data || []);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error al enviar pregunta'); }
    finally { setSubmittingQuestion(false); }
  };

  const handleCalculateShipping = () => {
    if (!postalCode || postalCode.length < 4) { toast.error('Ingresá un código postal válido'); return; }
    const result = getShippingByPostalCode(postalCode);
    setShipping(result);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />)}</div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = getDiscount(product.originalPrice || 0, product.price);
  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'];
  const installment = INSTALLMENTS[selectedInstallment];
  const installmentAmount = (Number(product.price) * (1 + installment.surcharge)) / installment.qty;
  const seller = product.seller;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-ms-blue">Inicio</Link>
            <ChevronLeft className="w-3 h-3 rotate-180" />
            {product.category && (
              <>
                <Link href={`/categorias/${product.category.slug}`} className="hover:text-ms-blue">{product.category.name}</Link>
                <ChevronLeft className="w-3 h-3 rotate-180" />
              </>
            )}
            <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA: IMÁGENES */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-4">
              {/* Imagen principal */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 group cursor-zoom-in bg-gray-50">
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {discount > 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white font-bold text-sm px-2 py-1 rounded-full">
                      -{discount}% OFF
                    </span>
                  </div>
                )}
                <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition">
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-ms-blue' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Compartir */}
              <button className="flex items-center gap-2 text-ms-blue text-sm mt-3 hover:underline">
                <Share2 className="w-4 h-4" /> Compartir
              </button>
            </div>
          </div>

          {/* COLUMNA CENTRAL: INFO PRODUCTO */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              {/* Condición y ventas */}
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                <span>{product.condition === 'new' ? 'Nuevo' : product.condition === 'used' ? 'Usado' : 'Reacondicionado'}</span>
                {product.reviewCount && product.reviewCount > 0 && (
                  <>
                    <span>·</span>
                    <span>{product.reviewCount} vendidos</span>
                  </>
                )}
              </div>

              {/* Título */}
              <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{product.title}</h1>

              {/* Rating */}
              {Number(product.rating) > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(product.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({product.reviewCount || 0} opiniones)</span>
                </div>
              )}

              {/* PRECIO */}
              <div className="mb-4">
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-gray-400 line-through text-base">{formatPrice(product.originalPrice)}</p>
                )}
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-gray-900">{formatPrice(product.price)}</span>
                  {discount > 0 && (
                    <span className="text-green-600 font-bold text-lg mb-0.5">{discount}% OFF</span>
                  )}
                </div>

                {/* Cuotas */}
                <div className="mt-2">
                  <button
                    onClick={() => setShowInstallments(!showInstallments)}
                    className="flex items-center gap-1 text-green-600 font-semibold text-sm hover:underline"
                  >
                    <CreditCard className="w-4 h-4" />
                    en 12x {formatPrice(Number(product.price) / 12)} sin interés
                    <ChevronDown className={`w-3 h-3 transition-transform ${showInstallments ? 'rotate-180' : ''}`} />
                  </button>

                  {showInstallments && (
                    <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tarjeta de crédito</p>
                      </div>
                      {INSTALLMENTS.map((inst, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedInstallment(i); setShowInstallments(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 transition text-left border-b border-gray-100 last:border-0 ${selectedInstallment === i ? 'bg-blue-50' : ''}`}
                        >
                          <span className="text-sm font-medium text-gray-700">{inst.label}</span>
                          <span className="text-sm font-bold text-gray-900">
                            {inst.qty}x {formatPrice((Number(product.price) * (1 + inst.surcharge)) / inst.qty)}
                            {inst.surcharge > 0 && <span className="text-red-500 text-xs ml-1">(+{Math.round(inst.surcharge * 100)}%)</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stock */}
              {product.stock !== undefined && (
                <div className="mb-4">
                  {product.stock > 0 ? (
                    <p className="text-sm text-gray-600">
                      Stock disponible
                      {product.stock <= 10 && <span className="text-orange-600 font-semibold ml-1">— ¡Solo quedan {product.stock}!</span>}
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Sin stock
                    </p>
                  )}
                </div>
              )}

              {/* Cantidad */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm text-gray-600">Cantidad:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-50 rounded-l-lg transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    className="p-2 hover:bg-gray-50 rounded-r-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ACCIONES */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={!product.stock || product.stock === 0}
                  className="w-full bg-ms-blue text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comprar ahora
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || !product.stock || product.stock === 0}
                  className="w-full bg-blue-100 text-ms-blue py-3 rounded-xl font-bold hover:bg-blue-200 transition disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  Agregar al carrito
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm border transition flex items-center justify-center gap-2 ${
                    isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                </button>
              </div>

              {/* GARANTÍAS */}
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                {[
                  { icon: Shield, text: 'Compra Protegida – Garantía de devolución', color: 'text-green-600' },
                  { icon: RotateCcw, text: 'Devolución gratis dentro de 30 días', color: 'text-blue-600' },
                ].map((g, i) => {
                  const Icon = g.icon;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon className={`w-4 h-4 ${g.color}`} />
                      <span>{g.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ENVÍO Y VENDEDOR */}
          <div className="space-y-4">
            {/* ENVÍO */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-ms-blue" /> Envío
              </h3>
              {product.freeShipping ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                  <Check className="w-4 h-4" /> Envío gratis a todo el país
                </div>
              ) : (
                <p className="text-gray-600 text-sm mb-3">Calculá el costo de envío</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculateShipping()}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ms-blue focus:border-transparent"
                />
                <button
                  onClick={handleCalculateShipping}
                  className="bg-ms-blue text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Calcular
                </button>
              </div>
              {shipping && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {shipping.cost === 0 ? '🎉 Envío gratis' : formatPrice(shipping.cost)}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {shipping.days}
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>Vendido por: {seller?.city || 'Argentina'}, {seller?.province || ''}</span>
              </div>
            </div>

            {/* VENDEDOR */}
            {seller && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">Vendedor</h3>
                <Link href={`/vendedor/${seller.id}`} className="flex items-center gap-3 group mb-3">
                  <div className="w-10 h-10 rounded-full bg-ms-blue flex items-center justify-center text-white font-bold">
                    {seller.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-ms-blue transition">{seller.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{Number(seller.reputation || 4.5).toFixed(1)}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto group-hover:text-ms-blue" />
                </Link>
                <div className="space-y-1.5 text-sm text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span>Ventas</span>
                    <span className="font-semibold text-gray-900">{Number(seller.totalSales || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calificación positiva</span>
                    <span className="font-semibold text-green-600">
                      {Math.min(99, Math.floor((seller.reputation || 4.5) * 19))}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleContactSeller}
                  className="w-full mt-3 border border-ms-blue text-ms-blue py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Preguntar al vendedor
                </button>
              </div>
            )}

            {/* MEDIOS DE PAGO */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-ms-blue" /> Medios de pago
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                {['💳 Tarjeta de crédito — Hasta 12 cuotas sin interés', '💳 Tarjeta de débito', '🏦 Transferencia bancaria', '⚡ Pago Simple (billetera digital)', '💵 Efectivo en puntos habilitados'].map((m, i) => (
                  <p key={i}>{m}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TABS: DESCRIPCIÓN, CARACTERÍSTICAS, OPINIONES, Q&A */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: 'description', label: 'Descripción' },
              { id: 'specs', label: 'Características' },
              { id: 'reviews', label: `Opiniones (${product.reviews?.length || 0})` },
              { id: 'questions', label: `Preguntas (${questions.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3.5 font-semibold text-sm whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id ? 'border-ms-blue text-ms-blue' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* DESCRIPCIÓN */}
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-700">
                {product.description ? (
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-gray-400 italic">Este producto no tiene descripción disponible.</p>
                )}
              </div>
            )}

            {/* CARACTERÍSTICAS */}
            {activeTab === 'specs' && (
              <div>
                {product.attributes && Object.keys(product.attributes).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.attributes).map(([key, val], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2.5 px-3 font-medium text-gray-700 w-1/3">{key}</td>
                          <td className="py-2.5 px-3 text-gray-900">{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: 'Marca', value: seller?.name || 'Sin especificar' },
                      { label: 'Condición', value: product.condition === 'new' ? 'Nuevo' : 'Usado' },
                      { label: 'Stock', value: `${product.stock || 0} unidades` },
                      { label: 'Categoría', value: product.category?.name || 'General' },
                    ].map((attr, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{attr.label}</p>
                        <p className="font-semibold text-gray-900 text-sm">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OPINIONES */}
            {activeTab === 'reviews' && (
              <div>
                {/* RESUMEN */}
                {Number(product.rating) > 0 && (
                  <div className="flex items-start gap-8 mb-6 pb-6 border-b border-gray-100">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900">{Number(product.rating).toFixed(1)}</div>
                      <div className="flex justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(product.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{product.reviewCount || 0} opiniones</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((s) => {
                        const reviews = product.reviews || [];
                        const count = reviews.filter((r: Review) => Number(r.rating) === s).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 w-16">
                              {[...Array(s)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* LISTA DE REVIEWS */}
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {product.reviews.map((review: Review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-ms-blue flex items-center justify-center text-white text-sm font-bold">
                              {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{review.user?.name || 'Usuario'}</p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-3 h-3 ${s <= Number(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-gray-400 text-xs">{formatDate(review.createdAt)}</span>
                        </div>
                        {review.title && <p className="font-semibold text-gray-900 text-sm mb-1">{review.title}</p>}
                        {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-center py-6">Este producto aún no tiene opiniones. ¡Sé el primero!</p>
                )}

                {/* FORMULARIO DE RESEÑA */}
                {isAuthenticated && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Dejar una opinión</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Tu calificación:</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}>
                              <Star className={`w-7 h-7 transition-all ${s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Título de tu opinión"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ms-blue"
                      />
                      <textarea
                        placeholder="Contá tu experiencia con este producto..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-ms-blue"
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-ms-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {submittingReview ? 'Enviando...' : 'Publicar opinión'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* PREGUNTAS Y RESPUESTAS */}
            {activeTab === 'questions' && (
              <div>
                {/* FORMULARIO PREGUNTA */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">¿Tenés alguna duda sobre este producto?</h3>
                  <form onSubmit={handleSubmitQuestion} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Escribí tu pregunta aquí..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      maxLength={2500}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ms-blue bg-white"
                    />
                    <button
                      type="submit"
                      disabled={submittingQuestion || !newQuestion.trim()}
                      className="bg-ms-blue text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {submittingQuestion ? '...' : 'Preguntar'}
                    </button>
                  </form>
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 mt-2">
                      <Link href="/auth/login" className="text-ms-blue underline">Iniciá sesión</Link> para hacer una pregunta
                    </p>
                  )}
                </div>

                {/* LISTA DE PREGUNTAS */}
                {questions.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p>Aún no hay preguntas. ¡Sé el primero en preguntar!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                            P
                          </div>
                          <p className="text-gray-800 text-sm">{q.question}</p>
                        </div>
                        {q.answer ? (
                          <div className="flex items-start gap-2 ml-4">
                            <div className="w-6 h-6 rounded-full bg-ms-blue flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                              R
                            </div>
                            <div>
                              <p className="text-gray-700 text-sm">{q.answer}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{q.answeredAt ? formatDate(q.answeredAt) : ''}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs ml-8 italic">El vendedor aún no respondió esta pregunta</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/productos/${p.id}`} className="block">
                  <div className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5 group">
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-50">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2 mb-1">{p.title}</p>
                    <p className="font-bold text-sm text-gray-900">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
