'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types';
import api from '@/lib/axios';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'sales', label: 'Más vendidos' },
];

const CATEGORIES_FILTER = [
  { name: 'Smartphones', slug: 'smartphones' },
  { name: 'Televisores', slug: 'televisores' },
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Electrodomésticos', slug: 'electrodomesticos' },
  { name: 'Ropa', slug: 'ropa' },
  { name: 'Calzado', slug: 'calzado' },
  { name: 'Deportes', slug: 'deportes' },
  { name: 'Hogar', slug: 'hogar' },
  { name: 'Tablets', slug: 'tablets' },
  { name: 'Cámaras', slug: 'camaras' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const sortBy = searchParams.get('sortBy') || 'newest';
  const categorySlug = searchParams.get('categorySlug') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const freeShipping = searchParams.get('freeShipping') || '';
  const condition = searchParams.get('condition') || '';

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (page > 1) params.set('page', String(page));
      params.set('sortBy', sortBy);
      if (categorySlug) params.set('categorySlug', categorySlug);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (freeShipping) params.set('freeShipping', freeShipping);
      if (condition) params.set('condition', condition);
      params.set('limit', '20');

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, page, sortBy, categorySlug, minPrice, maxPrice, freeShipping, condition]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/productos?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceMin) params.set('minPrice', priceMin);
    else params.delete('minPrice');
    if (priceMax) params.set('maxPrice', priceMax);
    else params.delete('maxPrice');
    params.delete('page');
    router.push(`/productos?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    setPriceMin('');
    setPriceMax('');
    router.push(`/productos?${params.toString()}`);
  };

  const hasFilters = categorySlug || minPrice || maxPrice || freeShipping || condition;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {search ? `Resultados para "${search}"` : 'Todos los productos'}
          </h1>
          {!isLoading && <p className="text-sm text-gray-500 mt-0.5">{total} productos encontrados</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" />Filtros
            {hasFilters && <span className="bg-ms-blue text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </button>
          <div className="relative">
            <select value={sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)} className="appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-ms-blue bg-white cursor-pointer">
              {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className={`w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Filtros</h3>
              {hasFilters && <button onClick={clearFilters} className="text-xs text-ms-blue hover:underline flex items-center gap-1"><X className="w-3 h-3" /> Limpiar</button>}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categoría</h4>
              <div className="space-y-1.5">
                <button onClick={() => updateFilter('categorySlug', '')} className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${!categorySlug ? 'bg-blue-50 text-ms-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Todas</button>
                {CATEGORIES_FILTER.map((cat) => (
                  <button key={cat.slug} onClick={() => updateFilter('categorySlug', cat.slug)} className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${categorySlug === cat.slug ? 'bg-blue-50 text-ms-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Precio (USD)</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input type="number" placeholder="Mín" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ms-blue" />
                  <input type="number" placeholder="Máx" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ms-blue" />
                </div>
                <button onClick={applyPriceFilter} className="w-full bg-ms-blue text-white text-xs py-1.5 rounded-md hover:bg-blue-700 transition-colors">Aplicar</button>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Condición</h4>
              <div className="space-y-1.5">
                {[{value:'',label:'Todos'},{value:'new',label:'Nuevo'},{value:'used',label:'Usado'},{value:'refurbished',label:'Reacondicionado'}].map((opt) => (
                  <button key={opt.value} onClick={() => updateFilter('condition', opt.value)} className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${condition === opt.value ? 'bg-blue-50 text-ms-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Envío</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={freeShipping === 'true'} onChange={(e) => updateFilter('freeShipping', e.target.checked ? 'true' : '')} className="rounded border-gray-300 text-ms-blue focus:ring-ms-blue" />
                <span className="text-sm text-gray-700">Envío gratis</span>
              </label>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg" />
                  <div className="p-3 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-5 bg-gray-200 rounded w-2/3" /></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No encontramos productos</h3>
              <p className="text-gray-500 text-sm mb-6">Intentá con otros términos o quitá algunos filtros</p>
              <button onClick={clearFilters} className="btn-primary">Limpiar filtros</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={page <= 1} onClick={() => updateFilter('page', String(page - 1))} className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed">Anterior</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return <button key={p} onClick={() => updateFilter('page', String(p))} className={`w-9 h-9 text-sm rounded-lg ${p === page ? 'bg-ms-blue text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{p}</button>;
                  })}
                  <button disabled={page >= totalPages} onClick={() => updateFilter('page', String(page + 1))} className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed">Siguiente</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200">
                <div className="aspect-square bg-gray-200 rounded-t-lg" />
                <div className="p-3 space-y-2"><div className="h-3 bg-gray-200 rounded" /><div className="h-5 bg-gray-200 rounded w-2/3" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
