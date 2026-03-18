'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(['']);

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
      await api.post('/products', {
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
      router.push('/vendedor/dashboard');
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vendedor/dashboard" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Publicar nuevo producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Información básica</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Título del producto *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="input-field"
                placeholder="Ej: Apple iPhone 14 128GB Negro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={5}
                className="input-field resize-none"
                placeholder="Describí tu producto en detalle: características, estado, incluye..."
              />
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

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Precio y stock</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio (ARS) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" className="input-field" placeholder="999.99" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio anterior (ARS)</label>
              <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} min="0" step="0.01" className="input-field" placeholder="1199.99" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={form.freeShipping}
              onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-ms-blue"
            />
            <span className="text-sm text-gray-700">Ofrecer envío gratis</span>
          </label>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-2">Imágenes *</h2>
          <p className="text-xs text-gray-500 mb-4">Ingresá URLs de imágenes (Unsplash, Imgur, etc.)</p>
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => updateImage(i, e.target.value)}
                  className="input-field flex-1"
                  placeholder={`https://images.unsplash.com/photo-...?w=600`}
                />
                {img && (
                  <img
                    src={img}
                    alt="preview"
                    className="w-10 h-10 object-contain bg-gray-50 rounded border border-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                )}
                {images.length > 1 && (
                  <button type="button" onClick={() => removeImageField(i)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {images.length < 6 && (
              <button type="button" onClick={addImageField} className="flex items-center gap-2 text-sm text-ms-blue hover:text-blue-700">
                <Plus className="w-4 h-4" /> Agregar otra imagen
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link href="/vendedor/dashboard" className="btn-secondary py-3 px-6">Cancelar</Link>
          <button type="submit" disabled={isLoading} className="flex-1 btn-green py-3 font-semibold flex items-center justify-center gap-2">
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
  );
}
