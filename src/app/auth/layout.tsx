import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ingresar / Registro',
  description: 'Iniciá sesión o creá tu cuenta en Mercado Simple.',
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
