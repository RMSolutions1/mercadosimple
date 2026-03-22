'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronRight,
  X,
  Star,
  Truck,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Heart,
  ShoppingCart,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice, getDiscount } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import type { Product, Category } from '@/types';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'best_selling';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Más relevantes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'best_selling', label: 'Más vendidos' },
];

const ITEMS_PER_PAGE = 20;

export default function BuscarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const conditionParam = searchParams.get('condition') || '';
  const priceMinParam = searchParams.get('priceMin') || '';
  const priceMaxParam = searchParams.get('priceMax') || '';
  const freeShippingParam = searchParams.get('freeShipping') || '';
  const sortByParam = (searchParams.get('sortBy') as SortOption) || 'relevance';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Local filter state
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [condition, setCondition] = useState(conditionParam);
  const [priceMin, setPriceMin] = useState(priceMinParam);
  const [priceMax, setPriceMax] = useState(priceMaxParam);
  const [freeShipping, setFreeShipping] = useState(freeShippingParam === 'true');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>(sortByParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  const buildUrl = useCallback(
    (overrides: Record<string, string | number | boolean | undefined> = {}) => {
      const params = new URLSearchParams();
      const vals = {
        q: query,
        category: selectedCategory,
        condition,
        priceMin,
        priceMax,
        freeShipping: freeShipping ? 'true' : '',
        sortBy: sortBy !== 'relevance' ? sortBy : '',
        page: currentPage > 1 ? String(currentPage) : '',
        ...overrides,
      };
      Object.entries(vals).forEach(([k, v]) => {
        const s = String(v ?? '');
        if (s) params.set(k, s);
      });
      return `/buscar?${params.toString()}`;
    },
    [query, selectedCategory, condition, priceMin, priceMax, freeShipping, sortBy, currentPage],
  );

  const applyFilters = useCallback(
    (overrides: Record<string, string | number | boolean | undefined> = {}) => {
      const url = buildUrl({ page: '1', ...overrides });
      router.push(url);
    },
    [buildUrl, router],
  );

  // Fetch categories
  useEffect(() => {
    api
      .get('/categories')
      .then((r) => setCategories(r.data?.categories ?? r.data ?? []))
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number | boolean> = {
          page: pageParam,
          limit: ITEMS_PER_PAGE,
        };
        if (query) params.search = query;
        if (categoryParam) params.categorySlug = categoryParam;
        if (conditionParam) params.condition = conditionParam;
        if (priceMinParam) params.minPrice = priceMinParam;
        if (priceMaxParam) params.maxPrice = priceMaxParam;
        if (freeShippingParam === 'true') params.freeShipping = true;
        if (sortByParam && sortByParam !== 'relevance') params.sortBy = sortByParam;

        const { data } = await api.get('/products', { params });
        setProducts(data.products ?? data.data ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / ITEMS_PER_PAGE));
      } catch {
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, categoryParam, conditionParam, priceMinParam, priceMaxParam, freeShippingParam, sortByParam, pageParam]);

  // Sync URL params to local state
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setCondition(conditionParam);
    setPriceMin(priceMinParam);
    setPriceMax(priceMaxParam);
    setFreeShipping(freeShippingParam === 'true');
    setSortBy(sortByParam);
    setCurrentPage(pageParam);
  }, [categoryParam, conditionParam, priceMinParam, priceMaxParam, freeShippingParam, sortByParam, pageParam]);

  const handleSort = (opt: SortOption) => {
    setSortBy(opt);
    setSortOpen(false);
    applyFilters({ sortBy: opt !== 'relevance' ? opt : undefined, page: undefined });
  };

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = buildUrl({ page: page > 1 ? String(page) : '' });
    router.push(url);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setCondition('');
    setPriceMin('');
    setPriceMax('');
    setFreeShipping(false);
    setMinRating(0);
    setSortBy('relevance');
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const hasActiveFilters = selectedCategory || condition || priceMin || priceMax || freeShipping || minRating > 0;

  const filteredProducts =
    minRating > 0 ? products.filter((p) => p.rating >= minRating) : products;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Búsqueda</span>
            {query && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* ───── SIDEBAR (desktop) ───── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-28 space-y-5">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Limpiar filtros
                </button>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <FilterSection title="Categorías">
                  <ul className="space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => applyFilters({ category: selectedCategory === cat.slug ? undefined : cat.slug })}
                          className={`w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors ${
                            selectedCategory === cat.slug
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </FilterSection>
              )}

              {/* Price range */}
              <FilterSection title="Precio">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-400 text-sm">-</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => applyFilters({ priceMin: priceMin || undefined, priceMax: priceMax || undefined })}
                  className="mt-2 w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Aplicar precio
                </button>
              </FilterSection>

              {/* Condition */}
              <FilterSection title="Condición">
                <div className="space-y-1.5">
                  {[
                    { value: '', label: 'Todos' },
                    { value: 'new', label: 'Nuevo' },
                    { value: 'used', label: 'Usado' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={condition === opt.value}
                        onChange={() => applyFilters({ condition: opt.value || undefined })}
                        className="accent-blue-600"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Free shipping */}
              <FilterSection title="Envío">
                <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                  <div
                    onClick={() => applyFilters({ freeShipping: !freeShipping ? 'true' : undefined })}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                      freeShipping ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        freeShipping ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-green-600" />
                    Envío gratis
                  </span>
                </label>
              </FilterSection>

              {/* Rating */}
              <FilterSection title="Calificación">
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={`flex items-center gap-1.5 w-full py-1.5 px-2 rounded-lg text-sm transition-colors ${
                        minRating === stars ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span>y más</span>
                    </button>
                  ))}
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* ───── MAIN CONTENT ───── */}
          <main className="flex-1 min-w-0">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                {query && (
                  <h1 className="text-xl font-semibold text-gray-900">
                    Resultados para &ldquo;{query}&rdquo;
                  </h1>
                )}
                {!loading && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {total.toLocaleString('es-AR')} resultado{total !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                  >
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleSort(opt.value)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              sortBy === opt.value
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* View toggle */}
                <div className="hidden sm:flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    title="Vista en grilla"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    title="Vista en lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <FilterPill
                    label={categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                    onRemove={() => applyFilters({ category: undefined })}
                  />
                )}
                {condition && (
                  <FilterPill
                    label={condition === 'new' ? 'Nuevo' : 'Usado'}
                    onRemove={() => applyFilters({ condition: undefined })}
                  />
                )}
                {(priceMin || priceMax) && (
                  <FilterPill
                    label={`Precio: ${priceMin || '0'} - ${priceMax || '∞'}`}
                    onRemove={() => {
                      setPriceMin('');
                      setPriceMax('');
                      applyFilters({ priceMin: undefined, priceMax: undefined });
                    }}
                  />
                )}
                {freeShipping && (
                  <FilterPill label="Envío gratis" onRemove={() => applyFilters({ freeShipping: undefined })} />
                )}
                {minRating > 0 && (
                  <FilterPill label={`${minRating}+ estrellas`} onRemove={() => setMinRating(0)} />
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-sm">Buscando productos...</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No encontramos resultados{query ? ` para "${query}"` : ''}
                </h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Revisá la ortografía o intentá con términos más generales.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p className="font-medium text-gray-700 mb-2">Sugerencias:</p>
                  <p>• Revisá la ortografía de la palabra</p>
                  <p>• Utilizá palabras más genéricas o menos palabras</p>
                  <p>• Navegá por las categorías del sitio</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline font-medium">
                      Limpiar todos los filtros
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Product grid */}
            {!loading && filteredProducts.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Product list */}
            {!loading && filteredProducts.length > 0 && viewMode === 'list' && (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <ListProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {generatePaginationRange(currentPage, totalPages).map((page, i) =>
                  page === '...' ? (
                    <span key={`dot-${i}`} className="px-2 text-gray-400 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ───── MOBILE FILTERS DRAWER ───── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Categories */}
              {categories.length > 0 && (
                <FilterSection title="Categorías">
                  <ul className="space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => {
                            setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug);
                          }}
                          className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                            selectedCategory === cat.slug
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </FilterSection>
              )}

              {/* Price */}
              <FilterSection title="Precio">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FilterSection>

              {/* Condition */}
              <FilterSection title="Condición">
                <div className="space-y-2">
                  {[
                    { value: '', label: 'Todos' },
                    { value: 'new', label: 'Nuevo' },
                    { value: 'used', label: 'Usado' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="m-condition"
                        checked={condition === opt.value}
                        onChange={() => setCondition(opt.value)}
                        className="accent-blue-600"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Free shipping */}
              <FilterSection title="Envío">
                <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                  <div
                    onClick={() => setFreeShipping(!freeShipping)}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                      freeShipping ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        freeShipping ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-green-600" />
                    Envío gratis
                  </span>
                </label>
              </FilterSection>

              {/* Rating */}
              <FilterSection title="Calificación">
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm transition-colors ${
                        minRating === stars ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span>y más</span>
                    </button>
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-5 py-4 flex gap-3">
              <button
                onClick={() => {
                  clearFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  applyFilters({
                    category: selectedCategory || undefined,
                    condition: condition || undefined,
                    priceMin: priceMin || undefined,
                    priceMax: priceMax || undefined,
                    freeShipping: freeShipping ? 'true' : undefined,
                  });
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full">
      {label}
      <button onClick={onRemove} className="hover:bg-blue-100 rounded-full p-0.5 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function ListProductCard({ product }: { product: Product }) {
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const mainImage = product.images?.[0] || 'https://placehold.co/300x300?text=Sin+imagen';
  const discount = getDiscount(product.originalPrice || 0, product.price);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Debés iniciar sesión para agregar al carrito');
      return;
    }
    await addItem(product.id, 1);
  };

  return (
    <Link href={`/productos/${product.slug || product.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer flex overflow-hidden">
        {/* Image */}
        <div className="relative w-52 sm:w-60 flex-shrink-0 bg-gray-50">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=Sin+imagen';
            }}
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-5 flex flex-col min-w-0">
          <div className="flex-1">
            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
                {(product.reviewCount || 0) > 0 && (
                  <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="text-base text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-snug">
              {product.title}
            </h3>

            {/* Price block */}
            <div className="mb-3">
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {discount > 0 && (
                  <span className="text-sm font-semibold text-green-600">{discount}% OFF</span>
                )}
              </div>
            </div>

            {/* Shipping */}
            {product.freeShipping && (
              <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium mb-2">
                <Truck className="w-4 h-4" />
                Envío gratis
              </div>
            )}

            {/* Seller */}
            {product.seller && (
              <p className="text-xs text-gray-500">
                por <span className="font-medium text-gray-700">{product.seller.name}</span>
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={isLoading || product.stock === 0}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.stock === 0 ? 'Sin stock' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Pagination helper ─── */
function generatePaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, '...');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('...', total);
  }

  return pages;
}
