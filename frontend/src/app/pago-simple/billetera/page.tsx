import type { Metadata } from 'next';
import Link from 'next/link';
import { PagoSimpleGuideLayout } from '@/components/pago-simple/PagoSimpleGuideLayout';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Mi billetera Pago Simple — Qué es y cómo funciona',
  description:
    'Saldo disponible, movimientos, seguridad y uso de la billetera digital Pago Simple en Mercado Simple. Guía para compradores y vendedores.',
  alternates: { canonical: `${SITE_URL}/pago-simple/billetera` },
  openGraph: {
    title: 'Mi billetera Pago Simple — Guía',
    url: `${SITE_URL}/pago-simple/billetera`,
    siteName: SITE_NAME,
  },
};

export default function PagoSimpleBilleteraGuiaPage() {
  return (
    <PagoSimpleGuideLayout
      title="Mi billetera Pago Simple"
      description="Tu cuenta digital dentro de Mercado Simple: guardá saldo, pagá compras al instante y cobrá ventas sin salir de la plataforma."
      ctaLabel="Ir a mi billetera"
      ctaHref="/mi-cuenta?tab=billetera"
    >
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">¿Qué es?</h2>
        <p>
          La billetera <strong>Pago Simple</strong> es el saldo asociado a tu usuario en {SITE_NAME}. Podés{' '}
          <strong>cargar dinero</strong>, <strong>pagar compras</strong>, <strong>transferir</strong> a otros
          usuarios, <strong>pagar servicios</strong> y, si vendés, <strong>recibir cobros</strong> por QR o link
          de pago.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Funcionalidades principales</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Saldo disponible</strong>: consultá en tiempo real cuánto tenés para usar o transferir.
          </li>
          <li>
            <strong>Pagar en el checkout</strong>: elegí &quot;Pago Simple — Mi billetera&quot; y el importe se
            descuenta al confirmar (si alcanza el saldo).
          </li>
          <li>
            <strong>Reintegros y devoluciones</strong>: cuando un pedido se cancela o se aprueba una devolución,
            el dinero puede acreditarse en tu billetera según las políticas del caso.
          </li>
          <li>
            <strong>Historial</strong>: movimientos de ingreso, egreso, pagos de servicios y transferencias quedan
            registrados para tu control.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Seguridad</h2>
        <p>
          Operás dentro de tu sesión protegida. No compartas contraseña ni códigos. Si detectás movimientos extraños,
          cambiá la clave y contactanos desde{' '}
          <Link href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contacto
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Primeros pasos</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Creá cuenta o ingresá en Mercado Simple.</li>
          <li>Entrá a Mi cuenta → pestaña Pago Simple / Mi billetera.</li>
          <li>Cargá saldo o recibí un cobro para empezar a usar el saldo.</li>
        </ol>
      </section>
    </PagoSimpleGuideLayout>
  );
}
