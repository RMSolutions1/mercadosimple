import type { Metadata } from 'next';
import Link from 'next/link';
import { PagoSimpleGuideLayout } from '@/components/pago-simple/PagoSimpleGuideLayout';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Cobrar con QR Pago Simple — Vendedores y comercios',
  description:
    'Cómo generar y usar tu QR de cobro Pago Simple: pagos al instante, comisiones, impresión y buenas prácticas para vendedores.',
  alternates: { canonical: `${SITE_URL}/pago-simple/cobrar-qr` },
  openGraph: {
    title: 'Cobrar con QR — Guía Pago Simple',
    url: `${SITE_URL}/pago-simple/cobrar-qr`,
    siteName: SITE_NAME,
  },
};

export default function PagoSimpleCobrarQrGuiaPage() {
  return (
    <PagoSimpleGuideLayout
      title="Cobrar con QR"
      description="Mostrá un código QR para que te paguen con billetera o medios habilitados. Ideal para ferias, delivery y cobros presenciales."
      ctaLabel="Ir a mi QR de cobro"
      ctaHref="/mi-cuenta?tab=qr"
    >
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">¿Para quién es?</h2>
        <p>
          Vendedores y comercios registrados en {SITE_NAME} pueden activar un <strong>QR estático o dinámico</strong>{' '}
          vinculado a su cuenta Pago Simple. El comprador escanea, confirma el monto y paga sin pasar datos sensibles
          en voz alta.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Funcionalidades</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>QR fijo</strong>: mismo código para todos los cobros; el cliente ingresa o confirma el importe en
            su app o flujo web.
          </li>
          <li>
            <strong>Monto sugerido</strong>: en algunos flujos podés predefinir producto o monto para agilizar la caja.
          </li>
          <li>
            <strong>Notificación</strong>: cuando el pago se acredita, lo ves en tu panel y en el historial de la
            billetera.
          </li>
          <li>
            <strong>Compartir o imprimir</strong>: descargá la imagen del QR para mostrarla en mostrador o sticker.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Comisiones y liquidación</h2>
        <p>
          Puede aplicarse una <strong>comisión por cobro</strong> según el tipo de cuenta y promociones vigentes. Los
          plazos de liquidación a tu saldo disponible (inmediato, T+1, T+2, etc.) se informan en las condiciones del
          producto y en el panel del vendedor.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Buenas prácticas</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Verificá en pantalla que el pago figure como &quot;acreditado&quot; antes de entregar el producto.</li>
          <li>No reenvíes capturas de tu QR a desconocidos para evitar suplantaciones.</li>
          <li>Combiná QR con <strong>links de pago</strong> para ventas online:{' '}
            <Link href="/pago-simple" className="text-blue-600 dark:text-blue-400 hover:underline">
              Acerca de Pago Simple
            </Link>
            .
          </li>
        </ul>
      </section>
    </PagoSimpleGuideLayout>
  );
}
