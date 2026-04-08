import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
  ctaLabel: string;
  ctaHref: string;
};

export function PagoSimpleGuideLayout({
  title,
  description,
  children,
  ctaLabel,
  ctaHref,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <nav className="text-blue-100 text-xs mb-4 flex flex-wrap items-center gap-1" aria-label="Migas de pan">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-80" aria-hidden />
            <Link href="/pago-simple" className="hover:underline">
              Pago Simple
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-80" aria-hidden />
            <span className="text-white font-medium">{title}</span>
          </nav>
          <h1
            className="text-3xl md:text-4xl font-black tracking-tight"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            {title}
          </h1>
          <p className="mt-3 text-blue-100 text-base md:text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
            {children}
          </div>

          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                Usar en tu cuenta
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Esta página es informativa. Para operar con dinero real, ingresá a tu cuenta.
              </p>
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors"
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/pago-simple"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-4"
              >
                ← Volver a Pago Simple
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
