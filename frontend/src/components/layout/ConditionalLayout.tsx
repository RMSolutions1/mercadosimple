'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

// Rutas que tienen su propio layout (sin Navbar ni Footer global)
const DASHBOARD_ROUTES = [
  '/mi-cuenta',
  '/vendedor/dashboard',
  '/vendedor/productos',
  '/vendedor/estadisticas',
  '/vendedor/preguntas',
  '/admin',
  '/billetera',
  '/pago-simple',
  '/chat',
  '/comprobante-servicio',
];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_ROUTES.some((route) => pathname?.startsWith(route));

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
