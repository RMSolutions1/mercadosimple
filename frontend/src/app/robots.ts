import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, '');
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/auth/', '/admin', '/vendedor/', '/mi-cuenta', '/perfil/', '/checkout', '/chat', '/billetera/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
