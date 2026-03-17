'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Truck, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getDiscount } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  initialFavorite?: boolean;
  showDiscount?: boolean;
}

export function ProductCard({ product, initialFavorite = false, showDiscount = false }: ProductCardProps) {
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const discount = getDiscount(product.originalPrice || 0, product.price);
  const mainImage = product.images?.[0] || 'https://placehold.co/300x300?text=Sin+imagen';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Debés iniciar sesión para agregar al carrito');
      return;
    }
    await addItem(product.id, 1);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Debés iniciar sesión para guardar favoritos');
      return;
    }
    try {
      const { data } = await api.post(`/favorites/${product.id}/toggle`);
      setIsFavorite(data.isFavorite);
      toast.success(data.isFavorite ? '❤️ Agregado a favoritos' : 'Eliminado de favoritos');
    } catch {
      toast.error('Error al actualizar favoritos');
    }
  };

  return (
    <Link href={`/productos/${product.slug || product.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-ms-blue transition-all group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-50">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=Sin+imagen';
            }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-ms-orange text-white text-xs font-bold px-2 py-0.5 rounded">
                -{discount}%
              </span>
            )}
            {product.freeShipping && (
              <span className="bg-ms-green text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Truck className="w-2.5 h-2.5" /> Gratis
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-ms-yellow fill-ms-yellow' : 'text-gray-200 fill-gray-200'}`} />
              ))}
              {(product.reviewCount || 0) > 0 && (
                <span className="text-xs text-gray-500">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Title */}
          <p className="text-sm text-gray-800 line-clamp-2 flex-1 leading-snug mb-2">{product.title}</p>

          {/* Price */}
          <div className="mt-auto">
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
            )}
            <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
            {product.seller && <p className="text-xs text-gray-500 mt-1 truncate">{product.seller.name}</p>}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="mt-3 w-full bg-ms-blue text-white text-sm py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </Link>
  );
}
