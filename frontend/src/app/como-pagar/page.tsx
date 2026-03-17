'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { CreditCard, Smartphone, Building2, Banknote, Shield, CheckCircle, ChevronRight, Wallet, QrCode, Clock, AlertCircle } from 'lucide-react';

const PAYMENT_METHODS = [
  {
    icon: '💳',
    title: 'Tarjeta de crédito',
    desc: 'Visa, Mastercard, American Express, Naranja X',
    details: ['Hasta 12 cuotas sin interés en productos seleccionados', 'Acreditación instantánea', 'Protegido por 3D Secure'],
    color: 'blue',
  },
  {
    icon: '💳',
    title: 'Tarjeta de débito',
    desc: 'Débito bancario directo de tu cuenta',
    details: ['Acreditación instantánea', 'Sin intereses ni recargos', 'Todas las tarjetas de débito argentinas'],
    color: 'green',
  },
  {
    icon: '🏦',
    title: 'Transferencia bancaria / CBU',
    desc: 'Transferí desde cualquier banco argentino',
    details: ['Acreditación en 1-2 horas hábiles', 'Sin comisión adicional', 'Compatible con home banking'],
    color: 'purple',
  },
  {
    icon: '⚡',
    title: 'Pago Simple — Mi billetera',
    desc: 'Pagá con tu saldo Pago Simple al instante',
    details: ['Acreditación instantánea', 'Sin comisiones', 'También para transferencias, servicios y recargas'],
    color: 'orange',
    highlight: true,
  },
  {
    icon: '📱',
    title: 'Mercado Pago',
    desc: 'Pagá con tu cuenta de Mercado Pago',
    details: ['Todos los medios de pago disponibles', 'Cuotas con o sin interés', 'Protección de compra incluida'],
    color: 'blue',
  },
  {
    icon: '💵',
    title: 'Efectivo (Rapipago / PagoFácil)',
    desc: 'Pagá en puntos de pago físicos',
    details: ['Más de 15.000 puntos en todo el país', 'Sin necesidad de tarjeta ni cuenta bancaria', 'Acreditación en 24-48 horas hábiles'],
    color: 'yellow',
  },
];

const INSTALLMENTS = [
  { cuotas: '1 cuota', label: 'Sin interés', icon: '✅' },
  { cuotas: '3 cuotas', label: 'Sin interés en bancos seleccionados', icon: '✅' },
  { cuotas: '6 cuotas', label: 'Sin interés en bancos seleccionados', icon: '✅' },
  { cuotas: '12 cuotas', label: 'Con interés según banco', icon: '⚠️' },
  { cuotas: '18 cuotas', label: 'Con interés según banco', icon: '⚠️' },
  { cuotas: '24 cuotas', label: 'Con interés según banco', icon: '⚠️' },
];

const STEPS = [
  { num: 1, title: 'Elegí tu producto', desc: 'Encontrá lo que buscás y hacé clic en "Comprar ahora" o agregalo al carrito.' },
  { num: 2, title: 'Completá el checkout', desc: 'Ingresá tu dirección de envío y revisá el resumen de tu pedido.' },
  { num: 3, title: 'Elegí cómo pagar', desc: 'Seleccioná el medio de pago que más te convenga y completá los datos.' },
  { num: 4, title: 'Confirmá tu compra', desc: 'Revisá todo y confirmá. Recibirás un correo con los detalles de tu pedido.' },
];

const FAQS = [
  { q: '¿Es seguro pagar en Mercado Simple?', a: 'Sí. Todos los pagos están protegidos con encriptación SSL de 256 bits y nunca almacenamos los datos completos de tu tarjeta. Además, contás con nuestra Compra Protegida.' },
  { q: '¿Cuándo se le cobra al vendedor?', a: 'El dinero queda retenido hasta que confirmás la recepción del producto en buen estado. Solo entonces se libera al vendedor.' },
  { q: '¿Puedo pagar en cuotas?', a: 'Sí, con tarjetas de crédito podés pagar en hasta 24 cuotas. La disponibilidad de cuotas sin interés depende del banco y del período de promoción vigente.' },
  { q: '¿Qué pasa si el pago falla?', a: 'Podés reintentar con otro medio de pago. El pedido se reserva por 30 minutos mientras completás el pago.' },
  { q: '¿Puedo cambiar el método de pago?', a: 'Podés cambiar el método de pago antes de confirmar la compra. Una vez confirmada, no es posible modificarlo.' },
];

export default function ComoPagarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ms-blue to-blue-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Cómo pagar en Mercado Simple</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Múltiples medios de pago seguros, con protección en cada compra. Tu dinero está seguro hasta que recibas lo que pediste.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Pasos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pasos para pagar</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="w-10 h-10 bg-ms-blue text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">{step.num}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Medios de pago */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Medios de pago disponibles</h2>
          <p className="text-gray-500 text-center mb-8">Elegí el que más te convenga, todos con la misma protección.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {PAYMENT_METHODS.map((m) => (
              <div key={m.title} className={`bg-white rounded-xl border-2 p-5 shadow-sm ${m.highlight ? 'border-ms-blue ring-1 ring-ms-blue/20' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{m.title}</h3>
                      {m.highlight && <span className="text-xs bg-ms-blue text-white px-2 py-0.5 rounded-full">Recomendado</span>}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{m.desc}</p>
                    <ul className="space-y-1">
                      {m.details.map((d) => (
                        <li key={d} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cuotas */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-ms-blue" /> Cuotas disponibles
          </h2>
          <p className="text-gray-500 mb-5">Con tarjeta de crédito podés financiar tu compra en varias cuotas.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {INSTALLMENTS.map((inst) => (
              <div key={inst.cuotas} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{inst.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{inst.cuotas}</p>
                  <p className="text-xs text-gray-500">{inst.label}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">* Las cuotas sin interés dependen del banco emisor y del período de promoción vigente.</p>
        </section>

        {/* Seguridad */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Tu pago está protegido
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">🔒</div>
              <p className="font-medium text-green-800 text-sm">Encriptación SSL</p>
              <p className="text-xs text-green-600">256 bits en cada transacción</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">🛡️</div>
              <p className="font-medium text-green-800 text-sm">Dinero retenido</p>
              <p className="text-xs text-green-600">Hasta que confirmés la entrega</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">↩️</div>
              <p className="font-medium text-green-800 text-sm">Reembolso garantizado</p>
              <p className="text-xs text-green-600">Si algo falla, te devolvemos el dinero</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-ms-blue text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">¿Listo para comprar?</h2>
          <p className="text-blue-100 mb-5">Explorá miles de productos con envío a todo el país.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/productos" className="bg-white text-ms-blue font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Ver productos
            </Link>
            <Link href="/como-comprar" className="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Cómo comprar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
