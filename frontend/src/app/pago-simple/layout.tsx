import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Pago Simple — Billetera digital, cobrá con links y QR | Mercado Simple',
  description:
    'Pagá servicios, recargá celular, transferí y cobrá con links o QR. Billetera digital argentina. Sin banco, sin hardware. Por Mercado Simple.',
  openGraph: {
    title: 'Pago Simple — Billetera digital y cobros al instante',
    description: 'Pagá servicios, recargá, transferí y cobrá con links o QR. Por Mercado Simple.',
    url: `${SITE_URL}/pago-simple`,
    siteName: SITE_NAME,
  },
  alternates: { canonical: `${SITE_URL}/pago-simple` },
};

export default function PagoSimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
