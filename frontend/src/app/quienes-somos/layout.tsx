import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Quiénes somos — Mercado Simple',
  description:
    'Conocé la historia y el equipo de Mercado Simple. Marketplace argentino con Compra Protegida y Pago Simple.',
  openGraph: { url: `${SITE_URL}/quienes-somos`, siteName: SITE_NAME },
  alternates: { canonical: `${SITE_URL}/quienes-somos` },
};

export default function QuienesSomosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
