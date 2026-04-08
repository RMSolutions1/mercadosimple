import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar productos | Mercado Simple',
  description:
    'Buscá entre miles de productos en Mercado Simple. Tecnología, moda, hogar y más con envío a todo Argentina.',
};

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
