import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contacto — Mercado Simple',
  description: 'Escribinos por consultas, soporte o sugerencias. Atención al cliente Mercado Simple.',
  openGraph: { url: `${SITE_URL}/contacto`, siteName: SITE_NAME },
  alternates: { canonical: `${SITE_URL}/contacto` },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
