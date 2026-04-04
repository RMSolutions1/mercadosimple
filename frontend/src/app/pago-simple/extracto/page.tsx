import type { Metadata } from 'next';
import Link from 'next/link';
import { PagoSimpleGuideLayout } from '@/components/pago-simple/PagoSimpleGuideLayout';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Extracto de cuenta Pago Simple — Movimientos y comprobantes',
  description:
    'Qué es el extracto Pago Simple, cómo leer cargas, pagos, transferencias y cómo descargar o compartir tu historial.',
  alternates: { canonical: `${SITE_URL}/pago-simple/extracto` },
  openGraph: {
    title: 'Extracto de cuenta — Guía Pago Simple',
    url: `${SITE_URL}/pago-simple/extracto`,
    siteName: SITE_NAME,
  },
};

export default function PagoSimpleExtractoGuiaPage() {
  return (
    <PagoSimpleGuideLayout
      title="Extracto de cuenta"
      description="Tu registro de movimientos de la billetera: entradas, salidas, pagos de servicios y cobros, con posibilidad de consulta y exportación."
      ctaLabel="Ver mi extracto"
      ctaHref="/billetera/extracto"
    >
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">¿Qué muestra el extracto?</h2>
        <p className="mb-3">
          El <strong>extracto de cuenta Pago Simple</strong> resume la actividad de tu billetera en un período. Incluye,
          según corresponda:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Cargas de saldo (tarjeta, transferencia, efectivo en red).</li>
          <li>Compras pagadas con saldo en {SITE_NAME}.</li>
          <li>Transferencias enviadas y recibidas entre usuarios.</li>
          <li>Pagos de servicios y recargas.</li>
          <li>Cobros por QR o link de pago (vendedores).</li>
          <li>Comisiones, impuestos o ajustes que apliquen.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Cómo usarlo</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Ingresá a <strong>Extracto de cuenta</strong> desde el acceso directo o desde Mi cuenta → historial /
            movimientos según el diseño actual.
          </li>
          <li>Filtrá por fechas si la herramienta lo permite.</li>
          <li>
            Descargá o imprimí el resumen para tu contabilidad personal o para presentar ante un reclamo (siempre
            conservá también los comprobantes individuales de cada operación).
          </li>
        </ol>
        <p className="mt-3">
          También podés revisar movimientos recientes en la pestaña{' '}
          <Link href="/mi-cuenta?tab=historial" className="text-blue-600 dark:text-blue-400 hover:underline">
            historial de billetera
          </Link>{' '}
          dentro de Mi cuenta.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Conciliación y discrepancias</h2>
        <p>
          Si un movimiento no coincide con lo que esperabas, anotá fecha, monto y referencia del comprobante y
          escribinos por{' '}
          <Link href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contacto
          </Link>
          . No compartas datos de tarjeta por email.
        </p>
      </section>
    </PagoSimpleGuideLayout>
  );
}
