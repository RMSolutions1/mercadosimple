'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Upload, Lightbulb, Image as ImageIcon, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const TIPS = [
  { icon: '📸', text: 'Usá fotos claras y de buena calidad con fondo blanco' },
  { icon: '✍️', text: 'Escribí un título descriptivo con marca, modelo y características clave' },
  { icon: '🚚', text: 'Incluí envío gratis para conseguir más ventas' },
  { icon: '💰', text: 'Precio competitivo = más consultas y ventas' },
  { icon: '📝', text: 'Una descripción detallada reduce preguntas y genera confianza' },
  { icon: '🏷️', text: 'Indicá el precio anterior si hay descuento para atraer compradores' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(['']);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '1',
    categoryId: '',
    brand: '',
    model: '',
    condition: 'new',
    freeShipping: false,
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) {
      router.push('/auth/login?returnUrl=' + encodeURIComponent('/vendedor/productos/nuevo'));
      return;
    }
    fetchCategories();
  }, [isAuthenticated, user]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error('Seleccioná una categoría');
      return;
    }
    const validImages = images.filter((img) => img.trim() !== '');
    if (validImages.length === 0) {
      toast.error('Agregá al menos una imagen');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/products', {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        stock: parseInt(form.stock),
        categoryId: form.categoryId,
        brand: form.brand || undefined,
        model: form.model || undefined,
        condition: form.condition,
        freeShipping: form.freeShipping,
        images: validImages,
      });
      toast.success('¡Producto publicado exitosamente!');
      router.push(data?.slug ? `/productos/${data.slug}` : '/vendedor/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al publicar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const addImageField = () => setImages([...images, '']);
  const removeImageField = (i: number) => setImages(images.filter((_, idx) => idx !== i));
  const updateImage = (i: number, val: string) => {
    const newImages = [...images];
    newImages[i] = val;
    setImages(newImages);
  };

  if (!isAuthenticated) return null;

  const previewPrice = parseFloat(form.price) || 0;
  const previewOriginal = parseFloat(form.originalPrice) || 0;
  const previewDiscount = previewOriginal > previewPrice ? Math.round((1 - previewPrice / previewOriginal) * 100) : 0;
  const previewImage = images.find(img => img.trim()) || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/vendedor/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Publicar nuevo producto</h1>
            <p className="text-sm text-gray-500">Completá los datos para que tu producto llegue a miles de compradores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* FORMULARIO PRINCIPAL */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-ms-blue text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Información básica
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Título del producto *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      maxLength={120}
                      className="input-field"
                      placeholder="Ej: Apple iPhone 14 128GB Negro"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-400">Incluí marca, modelo y características principales</p>
                      <span className={`text-xs ${form.title.length > 80 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {form.title.length}/120
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría *</label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        required
                        className="input-field"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Condición *</label>
                      <select
                        value={form.condition}
                        onChange={(e) => setForm({ ...form, condition: e.target.value })}
                        className="input-field"
                      >
                        <option value="new">Nuevo</option>
                        <option value="used">Usado</option>
                        <option value="refurbished">Reacondicionado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca</label>
                      <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" placeholder="Ej: Apple" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Modelo</label>
                      <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input-field" placeholder="Ej: iPhone 14" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Precio y stock */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-ms-blue text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Precio y stock
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio (ARS) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" className="input-field" placeholder="999.99" />
                    {previewPrice >= 5000 && (
                      <p className="text-xs text-green-600 mt-1">12 cuotas de {formatPrice(Math.ceil(previewPrice / 12))} sin interés</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio anterior</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} min="0" step="0.01" className="input-field" placeholder="1199.99" />
                    {previewDiscount > 0 && (
                      <p className="text-xs text-green-600 mt-1">{previewDiscount}% OFF se mostrará al comprador</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" className="input-field" />
                  </div>
                </div>
                <label className="flex items-center gap-3 mt-4 cursor-pointer p-3 bg-green-50 rounded-lg border border-green-200">
                  <input
                    type="checkbox"
                    checked={form.freeShipping}
                    onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600"
                  />
                  <div>
                    <span className="text-sm font-semibold text-green-700">🚚 Ofrecer envío gratis</span>
                    <p className="text-xs text-green-600">Los productos con envío gratis reciben hasta 3x más visitas</p>
                  </div>
                </label>
              </div>

              {/* Descripción */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-ms-blue text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Descripción
                </h2>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Describí tu producto en detalle: características, estado, qué incluye, dimensiones, color, garantía..."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">Sé detallado para reducir preguntas y generar confianza</p>
                  <span className={`text-xs ${form.description.length > 3000 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {form.description.length} caracteres
                  </span>
                </div>
              </div>

              {/* Imágenes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-ms-blue text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  Imágenes *
                </h2>
                <p className="text-xs text-gray-500 mb-4">Ingresá URLs de imágenes. La primera será la foto principal.</p>
                <div className="space-y-3">
                  {images.map((img, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {img.trim() ? (
                          <img src={img} alt="preview" className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-gray-300 text-lg">✕</span>'; }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => updateImage(i, e.target.value)}
                        className="input-field flex-1"
                        placeholder={i === 0 ? 'URL de la imagen principal' : `URL de la imagen ${i + 1}`}
                      />
                      {images.length > 1 && (
                        <button type="button" onClick={() => removeImageField(i)} className="text-red-400 hover:text-red-600 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {images.length < 10 && (
                    <button type="button" onClick={addImageField} className="flex items-center gap-2 text-sm text-ms-blue hover:text-blue-700 font-medium">
                      <Plus className="w-4 h-4" /> Agregar otra imagen (hasta 10)
                    </button>
                  )}
                </div>
              </div>

              {/* Vista previa */}
              {form.title && previewPrice > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <button type="button" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 font-bold text-gray-900 w-full">
                    <Eye className="w-5 h-5 text-ms-blue" />
                    Vista previa del producto
                    <span className="text-xs text-gray-400 ml-auto">{showPreview ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                  {showPreview && (
                    <div className="mt-4 max-w-xs mx-auto">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="aspect-square bg-gray-50 flex items-center justify-center">
                          {previewImage ? (
                            <img src={previewImage} alt="preview" className="w-full h-full object-contain p-4" />
                          ) : (
                            <ImageIcon className="w-16 h-16 text-gray-200" />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-gray-800 line-clamp-2 mb-2">{form.title}</p>
                          {previewOriginal > previewPrice && (
                            <p className="text-xs text-gray-400 line-through">{formatPrice(previewOriginal)}</p>
                          )}
                          <p className="text-lg font-bold text-gray-900">{formatPrice(previewPrice)}</p>
                          {previewDiscount > 0 && <span className="text-xs text-green-600 font-semibold">{previewDiscount}% OFF</span>}
                          {previewPrice >= 5000 && (
                            <p className="text-xs text-green-600">en 12x {formatPrice(Math.ceil(previewPrice / 12))} sin interés</p>
                          )}
                          {form.freeShipping && <p className="text-xs text-green-600 font-semibold mt-1">🚚 Envío gratis</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <Link href="/vendedor/dashboard" className="btn-secondary py-3 px-6">Cancelar</Link>
                <button type="submit" disabled={isLoading} className="flex-1 btn-green py-3 font-semibold flex items-center justify-center gap-2 text-lg">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" /> Publicar producto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* PANEL DE TIPS (sidebar derecho) */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Consejos para vender más
                </h3>
                <ul className="space-y-3">
                  {TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0">{tip.icon}</span>
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h4 className="font-bold text-green-800 text-sm mb-2">💰 Comisiones</h4>
                <p className="text-xs text-green-700 leading-relaxed">
                  Publicar es gratis. Solo cobramos una comisión del 5% sobre cada venta concretada. Sin costos fijos ni sorpresas.
                </p>
                <Link href="/comisiones" className="text-xs text-green-700 font-semibold hover:underline mt-2 inline-block">
                  Ver detalle de comisiones →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
