'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Package, Truck, MapPin, Clock, CheckCircle, DollarSign, AlertCircle, ChevronRight } from 'lucide-react';

const SHIPPING_OPTIONS = [
  {
    icon: '🚚',
    title: 'Envío por Mercado Simple',
    desc: 'Usamos nuestra red logística integrada',
    benefits: ['Retiro en domicilio del vendedor', 'Seguimiento en tiempo real para el comprador', 'Cobertura en todo el país', 'Seguro de envío incluido', 'Acreditación automática al entregarse'],
    cost: 'Gratis para plan Premium. Tarifa especial para Clásica.',
    highlight: true,
  },
  {
    icon: '📦',
    title: 'Envío propio (acordado)',
    desc: 'Coordinás directamente con el comprador',
    benefits: ['Usás el servicio de mensajería que prefieras', 'Total flexibilidad de precios', 'Comunicación directa por el chat', 'Código de seguimiento ingresado manualmente'],
    cost: 'El costo es del vendedor o lo acordás con el comprador.',
    highlight: false,
  },
  {
    icon: '🛵',
    title: 'Retiro en persona',
    desc: 'El comprador retira en tu domicilio o punto de entrega',
    benefits: ['Sin costo de envío', 'Entrega inmediata', 'Verificación del producto al momento', 'Coordinar por chat de la plataforma'],
    cost: 'Sin costo adicional.',
    highlight: false,
  },
];

const ZONES = [
  { zone: 'AMBA (Buenos Aires y GBA)', time: '24–48 hs', cost: 'Desde $350' },
  { zone: 'Interior Buenos Aires', time: '48–72 hs', cost: 'Desde $500' },
  { zone: 'Córdoba y Rosario', time: '48–72 hs', cost: 'Desde $600' },
  { zone: 'Resto del país', time: '3–5 días hábiles', cost: 'Desde $750' },
  { zone: 'Patagonia y NOA', time: '5–7 días hábiles', cost: 'Desde $950' },
  { zone: 'Islas / zonas remotas', time: 'A consultar', cost: 'A consultar' },
];

const TIPS = [
  { icon: '📷', tip: 'Fotografiá el paquete antes de enviarlo como prueba.' },
  { icon: '📦', tip: 'Usá embalaje adecuado para proteger el producto.' },
  { icon: '⏰', tip: 'Enviá dentro de las 48 hs de confirmado el pago para mantener tu reputación.' },
  { icon: '🔢', tip: 'Siempre informá el número de seguimiento al comprador.' },
  { icon: '🗃️', tip: 'Guardá el comprobante de envío hasta confirmarse la entrega.' },
];

const STEPS = [
  { num: 1, title: 'Vendiste', desc: 'Recibís la notificación de venta y el pago queda confirmado.' },
  { num: 2, title: 'Preparás el paquete', desc: 'Embalás el producto correctamente y lo rotulás con los datos del pedido.' },
  { num: 3, title: 'Lo enviás', desc: 'Elegís el método de envío y generás la etiqueta o coordinás el retiro.' },
  { num: 4, title: 'El comprador lo recibe', desc: 'El comprador confirma la recepción y se libera el pago a tu billetera.' },
];

export default function EnviosVendedorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Envíos para vendedores</h1>
          <p className="text-cyan-100 text-lg max-w-2xl mx-auto">
            Conocé todas las opciones de envío disponibles para tus ventas. Elegí la que mejor se adapte a tu negocio.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Cómo funciona */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Cómo funciona el proceso</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">{step.num}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Opciones de envío */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Opciones de envío disponibles</h2>
          <div className="space-y-4">
            {SHIPPING_OPTIONS.map((opt) => (
              <div key={opt.title} className={`bg-white rounded-xl border-2 p-5 shadow-sm ${opt.highlight ? 'border-teal-500' : 'border-gray-200'}`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{opt.title}</h3>
                      {opt.highlight && <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">Recomendado</span>}
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{opt.desc}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <ul className="space-y-1.5">
                        {opt.benefits.map((b) => (
                          <li key={b} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> {b}
                          </li>
                        ))}
                      </ul>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Costo</p>
                        <p className="text-sm text-gray-700">{opt.cost}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tarifas por zona */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" /> Tarifas estimadas por zona
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-600 font-semibold">Zona</th>
                  <th className="text-center px-4 py-2 text-gray-600 font-semibold">Tiempo estimado</th>
                  <th className="text-center px-4 py-2 text-gray-600 font-semibold">Costo desde</th>
                </tr>
              </thead>
              <tbody>
                {ZONES.map((z, i) => (
                  <tr key={z.zone} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-800 font-medium">{z.zone}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> {z.time}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-teal-600 font-semibold">{z.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> Las tarifas son referenciales y pueden variar según el peso y dimensiones del paquete.
          </p>
        </section>

        {/* Tips */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-amber-800 mb-5">💡 Consejos para enviar mejor</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIPS.map((t) => (
              <div key={t.tip} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-amber-100">
                <span className="text-xl">{t.icon}</span>
                <p className="text-sm text-gray-700">{t.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Links útiles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/vendedor/dashboard" className="flex-1 bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl text-center hover:bg-teal-700 transition-colors">
            Ir a mi panel de ventas
          </Link>
          <Link href="/seguimiento" className="flex-1 border border-teal-600 text-teal-600 font-semibold px-6 py-3 rounded-xl text-center hover:bg-teal-50 transition-colors">
            Rastrear envío
          </Link>
          <Link href="/ayuda" className="flex-1 border border-gray-300 text-gray-600 font-semibold px-6 py-3 rounded-xl text-center hover:bg-gray-50 transition-colors">
            Centro de ayuda
          </Link>
        </div>
      </div>
    </div>
  );
}
