'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; slug: string; }

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated, user } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [images, setImages] = useState<string[]>(['']);

  const [form, setForm] = useState({
    title: '', description: '', price: '', originalPrice: '', stock: '1',
    categoryId: '', brand: '', model: '', condition: 'new', freeShipping: false, status: 'active',
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) {
      router.push('/auth/login');
      return;
    }
    Promise.all([fetchProduct(), fetchCategories()]);
  }, [isAuthenticated, user, productId]);

  const fetchProduct = async () => {
    setIsFetching(true);
    try {
      const { data } = await api.get(`/products/${productId}`);
      setForm({
        title: data.title || '',
        description: data.description || '',
        price: String(data.price || ''),
        originalPrice: String(data.originalPrice || ''),
        stock: String(data.stock || '1'),
        categoryId: data.category?.id || data.categoryId || '',
        brand: data.brand || '',
        model: data.model || '',
        condition: data.condition || 'new',
        freeShipping: data.freeShipping || false,
        status: data.status || 'active',
      });
      setImages(data.images?.length > 0 ? data.images : ['']);
    } catch {
      toast.error('No se pudo cargar el producto');
      router.push('/vendedor/dashboard');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Seleccioná una categoría'); return; }
    const validImages = images.filter((img) => img.trim() !== '');
    if (validImages.length === 0) { toast.error('Agregá al menos una imagen'); return; }

    setIsLoading(true);
    try {
      await api.put(`/products/${productId}`, {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stock: parseInt(form.stock),
        categoryId: form.categoryId,
        brand: form.brand || null,
        model: form.model || null,
        condition: form.condition,
        freeShipping: form.freeShipping,
        status: form.status,
        images: validImages,
      });
      toast.success('¡Producto actualizado exitosamente!');
      router.push('/vendedor/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Error al actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vendedor/dashboard" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Información básica</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={5} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría *</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required className="input-field">
                  <option value="">Seleccionar</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Condición *</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input-field">
                  <option value="new">Nuevo</option>
                  <option value="used">Usado</option>
                  <option value="refurbished">Reacondicionado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado del anuncio</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Precio y stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio anterior</label>
              <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} min="0" step="0.01" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-ms-blue" />
            <span className="text-sm text-gray-700">Envío gratis</span>
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-2">Imágenes</h2>
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input type="url" value={img} onChange={(e) => { const n = [...images]; n[i] = e.target.value; setImages(n); }} className="input-field flex-1" placeholder="https://..." />
                {img && <img src={img} alt="preview" className="w-10 h-10 object-contain bg-gray-50 rounded border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                {images.length > 1 && (
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {images.length < 6 && (
              <button type="button" onClick={() => setImages([...images, ''])} className="flex items-center gap-2 text-sm text-ms-blue">
                <Plus className="w-4 h-4" /> Agregar imagen
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/vendedor/dashboard" className="btn-secondary py-3 px-6">Cancelar</Link>
          <button type="submit" disabled={isLoading} className="flex-1 btn-green py-3 font-semibold flex items-center justify-center gap-2">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Guardar cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}
