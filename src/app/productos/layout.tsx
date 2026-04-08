import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Productos — Comprá tecnología, moda, deportes y más',
  description:
    'Explorá miles de productos en Mercado Simple. Tecnología, moda, deportes, hogar, agro. Compra Protegida y envíos a todo el país.',
  openGraph: {
    title: 'Productos | Mercado Simple',
    url: `${SITE_URL}/productos`,
    siteName: SITE_NAME,
  },
  alternates: { canonical: `${SITE_URL}/productos` },
};

export default function ProductosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
