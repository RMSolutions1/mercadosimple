import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mercado Simple - Compra y vende lo que quieras | 🇦🇷 Argentina',
  description: 'Marketplace argentino con Compra Protegida y Pago Simple. Comprá y vendé electrónica, moda, deportes, agro y más. Envío a todo el país.',
  keywords: 'marketplace argentina, compra protegida, venta online, Pago Simple, envíos, tecnología, moda, deportes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '8px', background: '#333', color: '#fff' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
