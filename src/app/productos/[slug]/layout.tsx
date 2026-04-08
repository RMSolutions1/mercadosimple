import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!API_URL || !slug) {
    return { title: 'Producto | ' + SITE_NAME };
  }
  try {
    const base = API_URL.replace(/\/$/, '');
    const res = await fetch(`${base}/products/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: 'Producto | ' + SITE_NAME };
    const product = await res.json();
    const title = product.title || 'Producto';
    const description =
      product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
      `${title} en Mercado Simple. Compra Protegida y envíos a todo el país.`;
    const image = product.images?.[0] || product.image;
    const url = `${SITE_URL}/productos/${slug}`;
    return {
      title,
      description,
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url,
        siteName: SITE_NAME,
        type: 'website',
        ...(image && { images: [{ url: image, width: 800, height: 600, alt: title }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ${SITE_NAME}`,
        description,
      },
      alternates: { canonical: url },
    };
  } catch {
    return { title: 'Producto | ' + SITE_NAME };
  }
}

export default function ProductSlugLayout({ children }: Props) {
  return children;
}
