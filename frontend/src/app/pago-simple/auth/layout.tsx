import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Acceso Pago Simple',
  description: 'Ingresá o registrate en Pago Simple. Misma cuenta que Mercado Simple.',
  robots: { index: false, follow: true },
  openGraph: {
    title: `Acceso Pago Simple | ${SITE_NAME}`,
    url: `${SITE_URL}/pago-simple/auth/login`,
    siteName: SITE_NAME,
  },
};

export default function PagoSimpleAuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
