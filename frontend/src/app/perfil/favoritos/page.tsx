'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ChevronRight, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Favorite } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get('/favorites');
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await api.post(`/favorites/${productId}/toggle`);
      setFavorites(favorites.filter((f) => f.product.id !== productId));
      toast.success('Eliminado de favoritos');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/perfil" className="text-gray-500 hover:text-gray-700 text-sm">Mi perfil</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">Favoritos</h1>
        {favorites.length > 0 && (
          <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2 py-0.5 rounded-full">
            {favorites.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200">
              <div className="aspect-square bg-gray-200 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenés favoritos</h3>
          <p className="text-gray-500 mb-6 text-sm">Guardá los productos que te interesan para comprarlos después</p>
          <Link href="/productos" className="btn-primary">Explorar productos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="relative">
              <ProductCard product={fav.product} />
              <button
                onClick={() => handleRemove(fav.product.id)}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow border border-gray-200 hover:bg-red-50 text-red-500 transition-colors z-10"
                title="Quitar de favoritos"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
