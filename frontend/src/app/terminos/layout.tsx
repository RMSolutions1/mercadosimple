import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de la plataforma Mercado Simple.',
  openGraph: { url: `${SITE_URL}/terminos`, siteName: SITE_NAME },
  alternates: { canonical: `${SITE_URL}/terminos` },
  robots: { index: true, follow: true },
};

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
