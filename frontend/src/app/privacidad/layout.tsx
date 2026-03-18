import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales en Mercado Simple.',
  openGraph: { url: `${SITE_URL}/privacidad`, siteName: SITE_NAME },
  alternates: { canonical: `${SITE_URL}/privacidad` },
  robots: { index: true, follow: true },
};

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
