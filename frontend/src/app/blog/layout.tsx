import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Blog — Consejos de ventas, e-commerce y billetera digital',
  description:
    'Artículos sobre ventas online, compra protegida, Pago Simple y cómo vender en Mercado Simple. Argentina.',
  openGraph: { url: `${SITE_URL}/blog`, siteName: SITE_NAME },
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
