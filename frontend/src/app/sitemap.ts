import { MetadataRoute } from 'next';
import { SITE_URL, STATIC_SITEMAP_PATHS } from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, '');
  const staticUrls: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map((path) => ({
    url: `${base}${path || ''}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/productos' ? 'daily' : ('weekly' as const),
    priority: path === '' ? 1 : path === '/productos' || path === '/pago-simple' ? 0.9 : 0.7,
  }));

  // Productos dinámicos: si hay API, obtener slugs
  let productUrls: MetadataRoute.Sitemap = [];
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/products?limit=3000`, {
        next: { revalidate: 3600 },
      });
      const data = await res.json();
      const products = data.products || data || [];
      const list = Array.isArray(products) ? products : [];
      productUrls = list.map((p: { slug?: string; id?: string; updatedAt?: string }) => ({
        url: `${base}/productos/${p.slug || p.id || ''}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })).filter((e: { url: string }) => e.url && !e.url.endsWith('/productos/'));
    } catch {
      // Sin API o error: solo rutas estáticas
    }
  }

  return [...staticUrls, ...productUrls];
}
