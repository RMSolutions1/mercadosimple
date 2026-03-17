'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { RotateCcw, CheckCircle, AlertCircle, Clock, ChevronRight, Shield, Package } from 'lucide-react';

const RETURN_REASONS = [
  { icon: '📦', title: 'Llegó dañado', desc: 'El producto llegó roto, golpeado o en mal estado.', covered: true },
  { icon: '❌', title: 'No funciona', desc: 'El producto no enciende o tiene fallas de fábrica.', covered: true },
  { icon: '🔄', title: 'No es lo que pedí', desc: 'Recibiste un producto diferente al que compraste.', covered: true },
  { icon: '📏', title: 'Talle o medida incorrecta', desc: 'El producto no tiene las dimensiones indicadas.', covered: true },
  { icon: '💭', title: 'Me arrepentí', desc: 'Cambiaste de opinión o ya no lo necesitás.', covered: true, days: 30 },
  { icon: '🎨', title: 'Color o modelo diferente', desc: 'Llegó en un color o versión distinta a la publicada.', covered: true },
  { icon: '🔧', title: 'Falla dentro de la garantía', desc: 'El producto falló dentro del período de garantía.', covered: true },
];

const NOT_COVERED = [
  'Productos usados o sin embalaje original',
  'Productos dañados por mal uso del comprador',
  'Alimentos, bebidas o productos perecederos',
  'Software activado o licencias utilizadas',
  'Productos de higiene personal (sin defecto de fábrica)',
  'Productos personalizados o a medida',
];

const STEPS = [
  { num: 1, title: 'Reportá el problema', desc: 'Ingresá a "Mis pedidos" y seleccioná la compra. Hacé clic en "Tengo un problema".' },
  { num: 2, title: 'Elegí el motivo', desc: 'Seleccioná el motivo de la devolución y subí fotos o videos si aplica.' },
  { num: 3, title: 'Esperá la aprobación', desc: 'El equipo de Mercado Simple evaluará tu caso en hasta 48 hs hábiles.' },
  { num: 4, title: 'Devolvé el producto', desc: 'Una vez aprobado, enviás el producto al vendedor con etiqueta de envío gratuita.' },
  { num: 5, title: 'Recibí el reembolso', desc: 'Cuando el vendedor confirme la recepción, el dinero se acredita en tu billetera.' },
];

const FAQS = [
  { q: '¿Cuánto tiempo tengo para pedir una devolución?', a: 'Tenés 30 días desde la fecha de entrega para pedir la devolución en la mayoría de los casos. Para arrepentimiento de compra, el plazo es de 10 días hábiles según el Artículo 34 de la Ley 24.240.' },
  { q: '¿Debo pagar el envío de la devolución?', a: 'No. Si el producto tiene algún defecto o no es lo que pediste, el costo del envío de devolución lo cubre Mercado Simple. Si es por arrepentimiento, el costo puede ser del comprador.' },
  { q: '¿Cuánto tarda en acreditarse el reembolso?', a: 'Una vez aprobada la devolución y recibido el producto por el vendedor, el reembolso se acredita en tu cuenta Pago Simple en 1-3 días hábiles. Para devoluciones a tarjeta puede demorar 5-10 días.' },
  { q: '¿Qué pasa si el vendedor no acepta la devolución?', a: 'Si el vendedor rechaza tu solicitud y la causa está cubierta por nuestra política, Mercado Simple mediará y resolverá el caso a tu favor.' },
  { q: '¿Puedo cambiar el producto en lugar de devolverlo?', a: 'Sí, si el vendedor tiene stock disponible del producto correcto podés solicitar un cambio en lugar de un reembolso.' },
];

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Devoluciones y reembolsos</h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            Tu satisfacción es nuestra prioridad. Si algo no está bien con tu compra, te ayudamos a resolverlo.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Cómo funciona */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Cómo funciona el proceso</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{step.num}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Motivos cubiertos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cuándo podés pedir devolución?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RETURN_REASONS.map((r) => (
              <div key={r.title} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{r.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{r.title}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">✓ Cubierto</span>
                    {r.days && <span className="text-xs text-gray-500">{r.days} días</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* No cubierto */}
        <section className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Qué NO está cubierto
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {NOT_COVERED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-red-700">
                <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span> {item}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Ley del consumidor */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Ley de Defensa del Consumidor (Ley 24.240)
          </h3>
          <p className="text-sm text-blue-800">
            Como consumidor argentino, tenés derecho a retractarte de una compra online dentro de los <strong>10 días hábiles</strong> desde la entrega, sin necesidad de dar explicaciones. El vendedor debe reintegrarte el dinero pagado.
          </p>
          <Link href="/defensa-consumidor" className="text-sm text-ms-blue font-semibold mt-2 inline-block hover:underline">
            Ver más sobre tus derechos →
          </Link>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/perfil/pedidos" className="flex-1 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl text-center hover:bg-orange-600 transition-colors">
            Ir a Mis pedidos
          </Link>
          <Link href="/proteccion-comprador" className="flex-1 border border-orange-500 text-orange-500 font-semibold px-6 py-3 rounded-xl text-center hover:bg-orange-50 transition-colors">
            Compra Protegida
          </Link>
          <Link href="/ayuda" className="flex-1 border border-gray-300 text-gray-600 font-semibold px-6 py-3 rounded-xl text-center hover:bg-gray-50 transition-colors">
            Centro de ayuda
          </Link>
        </div>
      </div>
    </div>
  );
}
