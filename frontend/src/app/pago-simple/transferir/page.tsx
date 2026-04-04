import type { Metadata } from 'next';
import Link from 'next/link';
import { PagoSimpleGuideLayout } from '@/components/pago-simple/PagoSimpleGuideLayout';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Transferir dinero Pago Simple — Entre usuarios y límites',
  description:
    'Cómo transferir saldo Pago Simple a otro usuario de Mercado Simple. Pasos, tiempos, seguridad y buenas prácticas.',
  alternates: { canonical: `${SITE_URL}/pago-simple/transferir` },
  openGraph: {
    title: 'Transferir dinero — Guía Pago Simple',
    url: `${SITE_URL}/pago-simple/transferir`,
    siteName: SITE_NAME,
  },
};

export default function PagoSimpleTransferirGuiaPage() {
  return (
    <PagoSimpleGuideLayout
      title="Transferir dinero"
      description="Enviá pesos de tu billetera a otra persona que use Mercado Simple, de forma rápida y sin compartir datos bancarios con el destinatario."
      ctaLabel="Ir a transferir"
      ctaHref="/mi-cuenta?tab=transferir"
    >
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">¿Cómo funciona?</h2>
        <p>
          Las transferencias Pago Simple mueven saldo <strong>entre billeteras de usuarios</strong> de la misma
          plataforma. No reemplazan un CBU bancario: el dinero sale de tu saldo disponible y se acredita en el saldo
          del usuario destino (sujeto a reglas y límites del sistema).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Pasos típicos</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Ingresá a Mi cuenta → <strong>Transferir dinero</strong>.</li>
          <li>
            Indicá el <strong>monto</strong> y el <strong>destinatario</strong> (email, alias o método que indique
            la pantalla).
          </li>
          <li>Revisá el resumen y confirmá. Verificá que el monto y el destinatario sean correctos.</li>
          <li>El destinatario verá el ingreso en su historial cuando la operación se complete.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tiempos</h2>
        <p>
          Las transferencias entre usuarios suelen ser <strong>inmediatas</strong> una vez confirmadas. Si hay
          revisión manual o validaciones de seguridad, podría demorarse; en ese caso verás el estado en tu historial.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Seguridad y buenas prácticas</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Transferí solo a personas de confianza; las operaciones confirmadas pueden no revertirse.</li>
          <li>No compartas códigos de acceso ni claves por WhatsApp o redes.</li>
          <li>Si te piden dinero por una compra externa a {SITE_NAME}, desconfiá: usá siempre el flujo de compra protegida.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Más información</h2>
        <p>
          Consultá también{' '}
          <Link href="/pago-simple/billetera" className="text-blue-600 dark:text-blue-400 hover:underline">
            Mi billetera
          </Link>{' '}
          y los{' '}
          <Link href="/terminos" className="text-blue-600 dark:text-blue-400 hover:underline">
            Términos y condiciones
          </Link>
          .
        </p>
      </section>
    </PagoSimpleGuideLayout>
  );
}
