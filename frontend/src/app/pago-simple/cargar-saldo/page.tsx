import type { Metadata } from 'next';
import Link from 'next/link';
import { PagoSimpleGuideLayout } from '@/components/pago-simple/PagoSimpleGuideLayout';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Cargar saldo Pago Simple — Medios y rubros habilitados',
  description:
    'Cómo cargar saldo en Pago Simple: tarjeta, transferencia, efectivo en redes habilitadas. Luz, gas, TV, prepagas, celular y más.',
  alternates: { canonical: `${SITE_URL}/pago-simple/cargar-saldo` },
  openGraph: {
    title: 'Cargar saldo — Guía Pago Simple',
    url: `${SITE_URL}/pago-simple/cargar-saldo`,
    siteName: SITE_NAME,
  },
};

export default function PagoSimpleCargarSaldoGuiaPage() {
  return (
    <PagoSimpleGuideLayout
      title="Cargar saldo"
      description="Conocé las formas de ingresar dinero a tu billetera y qué tipo de servicios y empresas podés abonar desde Pago Simple."
      ctaLabel="Cargar saldo ahora"
      ctaHref="/mi-cuenta?tab=depositar"
    >
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">¿Qué podés cargar?</h2>
        <p className="mb-3">
          Cargar saldo significa <strong>agregar pesos argentinos</strong> a tu billetera para usarlos en compras
          en {SITE_NAME}, transferencias, pagos de facturas y recargas. El saldo no es una cuenta bancaria
          tradicional: es un <strong>saldo electrónico</strong> dentro de la plataforma.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Formas habituales de carga</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Tarjeta de crédito o débito</strong>: pago en línea; la acreditación suele ser inmediata o en
            minutos según el procesador.
          </li>
          <li>
            <strong>Transferencia bancaria / CVU o alias</strong>: cuando esté disponible en tu cuenta, seguí los
            datos que muestra la pantalla de carga; los tiempos dependen del banco (habitualmente horas hábiles).
          </li>
          <li>
            <strong>Efectivo en redes de cobro</strong> (Rapipago, Pago Fácil u otras integradas): generás un cupón
            o código y pagás en sucursal; la acreditación puede demorar hasta 24–48 h hábiles.
          </li>
        </ul>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
          Los medios exactos pueden variar según la configuración vigente de la plataforma. Siempre verificá las
          opciones que ves en <strong>Mi cuenta → Cargar saldo</strong>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Rubros y servicios que podés pagar con saldo
        </h2>
        <p className="mb-3">
          Una vez cargado el saldo, desde <strong>Pagar servicios</strong> podés abonar facturas y recargas de
          distintas categorías, por ejemplo:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Servicios públicos y utilities</strong>: electricidad, gas, agua, internet, telefonía fija.
          </li>
          <li>
            <strong>TV y entretenimiento</strong>: cable, satelital, streaming prepago según empresas habilitadas.
          </li>
          <li>
            <strong>Celular y recargas</strong>: todas las operadoras que figuren en el catálogo del momento.
          </li>
          <li>
            <strong>Prepagas y salud</strong>: planes médicos prepagos cuando estén listados.
          </li>
          <li>
            <strong>Transporte</strong>: por ejemplo SUBE u otros medios que integremos.
          </li>
          <li>
            <strong>Impuestos y tasas</strong>, <strong>educación</strong>, <strong>seguros</strong> y otros rubros
            que vayan sumándose al catálogo.
          </li>
        </ul>
        <p className="mt-3">
          El listado de <strong>empresas habilitadas</strong> se elige desde el buscador de servicios en tu cuenta: ahí
          ves nombres concretos (Edenor, Metrogas, Movistar, etc.) según lo que tengamos integrado en cada momento.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Límites y comisiones</h2>
        <p>
          Podrían aplicarse límites diarios o por operación y comisiones según el medio de carga. Los montos y
          leyendas se muestran <strong>antes de confirmar</strong> cada operación. Para dudas puntuales,{' '}
          <Link href="/ayuda" className="text-blue-600 dark:text-blue-400 hover:underline">
            Centro de ayuda
          </Link>
          .
        </p>
      </section>
    </PagoSimpleGuideLayout>
  );
}
