import type { Metadata } from 'next';
import Link from 'next/link';
import { PagoSimpleGuideLayout } from '@/components/pago-simple/PagoSimpleGuideLayout';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Pagar servicios con Pago Simple — Facturas, recargas y rubros',
  description:
    'Guía para pagar luz, gas, agua, internet, TV, celular, prepagas, SUBE y más con saldo Pago Simple en Mercado Simple.',
  alternates: { canonical: `${SITE_URL}/pago-simple/pagar-servicios` },
  openGraph: {
    title: 'Pagar servicios — Guía Pago Simple',
    url: `${SITE_URL}/pago-simple/pagar-servicios`,
    siteName: SITE_NAME,
  },
};

export default function PagoSimplePagarServiciosGuiaPage() {
  return (
    <PagoSimpleGuideLayout
      title="Pagar servicios"
      description="Usá tu saldo Pago Simple para abonar facturas y recargas de empresas habilitadas, sin colas ni papel."
      ctaLabel="Ir a pagar servicios"
      ctaHref="/mi-cuenta?tab=servicios"
    >
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">¿Qué es esta función?</h2>
        <p>
          Desde <strong>Pagar servicios</strong> buscás la empresa (por nombre o rubro), ingresás los datos que pide
          cada servicio (número de cliente, DNI, código de barras, etc.) y abonás con tu <strong>saldo Pago Simple</strong>.
          Recibís comprobante digital según corresponda.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Rubros cubiertos (orientativo)</h2>
        <p className="mb-3">
          El catálogo se actualiza periódicamente. Ejemplos de categorías que suelen estar disponibles:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Luz y electricidad</strong> — distribuidoras según región.
          </li>
          <li>
            <strong>Gas natural</strong> — metrogas y redes regionales.
          </li>
          <li>
            <strong>Agua y cloacas</strong>.
          </li>
          <li>
            <strong>Internet y telefonía fija</strong>.
          </li>
          <li>
            <strong>TV por cable / satelital / packs</strong> según integración.
          </li>
          <li>
            <strong>Celular</strong> — recargas y packs de Movistar, Claro, Personal y otras.
          </li>
          <li>
            <strong>Prepagas de salud</strong>, <strong>tarjetas</strong>, <strong>transporte (SUBE)</strong>,{' '}
            <strong>impuestos municipales o nacionales</strong>, <strong>educación</strong>, <strong>seguros</strong>, etc.
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          La disponibilidad real de cada empresa la ves en el buscador dentro de tu cuenta; no todas las marcas están en
          todas las provincias.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Cómo pagar (flujo general)</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Tené saldo suficiente (o cargá desde <Link href="/pago-simple/cargar-saldo" className="text-blue-600 dark:text-blue-400 hover:underline">Cargar saldo</Link>).</li>
          <li>Elegí rubro o buscá la empresa por nombre.</li>
          <li>Completá los datos del servicio y el importe si aplica.</li>
          <li>Confirmá el pago y guardá o descargá el comprobante.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Errores y reintegros</h2>
        <p>
          Si un pago falla por datos incorrectos, el débito no debería efectuarse; si hubo un error de sistema,
          contactanos con el detalle desde{' '}
          <Link href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contacto
          </Link>{' '}
          o{' '}
          <Link href="/ayuda" className="text-blue-600 dark:text-blue-400 hover:underline">
            Ayuda
          </Link>
          .
        </p>
      </section>
    </PagoSimpleGuideLayout>
  );
}
