'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, User, ChevronRight, Tag, TrendingUp, Search } from 'lucide-react';

const CATEGORIES = ['Todos', 'Vendedores', 'Compradores', 'Tecnología', 'Finanzas', 'Novedades', 'Tutoriales'];

const POSTS = [
  {
    id: 1, category: 'Vendedores', date: '12 Mar 2026', author: 'Equipo Mercado Simple',
    title: '10 consejos para aumentar tus ventas online en 2026',
    excerpt: 'Descubrí las estrategias más efectivas para destacarte entre miles de vendedores y aumentar tus ingresos este año.',
    readTime: '8 min', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', featured: true,
  },
  {
    id: 2, category: 'Compradores', date: '8 Mar 2026', author: 'Laura Fernández',
    title: 'Cómo identificar vendedores confiables en plataformas online',
    excerpt: 'Te damos las claves para comprar con tranquilidad y evitar estafas al comprar por internet.',
    readTime: '5 min', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80', featured: false,
  },
  {
    id: 3, category: 'Tecnología', date: '5 Mar 2026', author: 'Diego González',
    title: 'Inteligencia Artificial en el e-commerce: el futuro es hoy',
    excerpt: 'Cómo la IA está transformando la experiencia de compra y las herramientas que ya usamos en Mercado Simple.',
    readTime: '6 min', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80', featured: false,
  },
  {
    id: 4, category: 'Finanzas', date: '1 Mar 2026', author: 'Ana Martínez',
    title: 'Billetera digital vs cuenta bancaria: ¿cuál conviene más en Argentina?',
    excerpt: 'Analizamos las ventajas y desventajas de cada opción para manejar tu dinero en el día a día.',
    readTime: '7 min', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80', featured: false,
  },
  {
    id: 5, category: 'Tutoriales', date: '25 Feb 2026', author: 'Equipo Mercado Simple',
    title: 'Guía completa: cómo publicar tu primer producto paso a paso',
    excerpt: 'Video tutorial y guía escrita para que publiques tu producto en menos de 10 minutos.',
    readTime: '10 min', image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80', featured: false,
  },
  {
    id: 6, category: 'Novedades', date: '20 Feb 2026', author: 'Valentina López',
    title: 'Nuevas funciones: reseñas con fotos y video en Mercado Simple',
    excerpt: 'Ahora los compradores pueden adjuntar fotos y videos a sus opiniones. Te contamos cómo funciona.',
    readTime: '4 min', image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&q=80', featured: false,
  },
  {
    id: 7, category: 'Vendedores', date: '15 Feb 2026', author: 'Carlos Pérez',
    title: 'Cómo calcular el precio de venta perfecto para tus productos',
    excerpt: 'Fórmulas y estrategias para fijar precios competitivos sin sacrificar tu rentabilidad.',
    readTime: '9 min', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80', featured: false,
  },
  {
    id: 8, category: 'Compradores', date: '10 Feb 2026', author: 'Equipo Mercado Simple',
    title: 'El poder del tracking: seguí tu compra en tiempo real',
    excerpt: 'Explicamos cómo funciona nuestro sistema de seguimiento de envíos y qué significa cada estado.',
    readTime: '3 min', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', featured: false,
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = POSTS.filter((p) => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find((p) => p.featured) || filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Blog Mercado Simple</h1>
          <p className="text-orange-100 text-lg mb-6">Consejos, novedades y tutoriales para compradores y vendedores</p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar artículos..." className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-rose-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron artículos para "{search}"</p>
          </div>
        ) : (
          <>
            {/* Artículo destacado */}
            {featured && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-8 hover:shadow-md transition-shadow group cursor-pointer">
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">{featured.category}</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⭐ Destacado</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-rose-500 transition-colors">{featured.title}</h2>
                    <p className="text-gray-500 text-sm mb-4">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{featured.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime} de lectura</span>
                      <span>{featured.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de artículos */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((post) => (
                <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="h-44 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{post.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug group-hover:text-rose-500 transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
