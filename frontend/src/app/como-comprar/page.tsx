import Link from 'next/link';
import { Search, ShoppingCart, CreditCard, Truck, CheckCircle, Shield, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Buscá lo que necesitás',
    desc: 'Usá la barra de búsqueda o explorá las categorías para encontrar el producto perfecto. Filtrá por precio, categoría, condición y más.',
    tip: 'Consejo: Activá "Envío gratis" en los filtros para ahorrar en el envío.',
  },
  {
    number: '02',
    icon: ShoppingCart,
    title: 'Agregá al carrito o comprá ahora',
    desc: 'Desde la página del producto podés agregar al carrito para seguir comprando o hacer clic en "Comprar ahora" para ir directo al checkout.',
    tip: 'Podés agregar productos de distintos vendedores en el mismo carrito.',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Elegí cómo pagar',
    desc: 'Pagá con tarjeta de crédito en hasta 12 cuotas sin interés, débito, efectivo o con saldo en Pago Simple (tu billetera digital).',
    tip: 'Con Pago Simple el pago es instantáneo y tu saldo se descuenta automáticamente.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Recibí tu pedido',
    desc: 'Seguí el estado de tu pedido desde "Mis compras". Recibirás notificaciones en cada etapa: confirmado, en camino y entregado.',
    tip: 'Podés rastrear tu envío en tiempo real con el número de seguimiento.',
  },
  {
    number: '05',
    icon: CheckCircle,
    title: 'Calificá tu experiencia',
    desc: 'Una vez recibido el producto, calificá al vendedor y dejá tu reseña. Ayudás a la comunidad y mejorás la experiencia de todos.',
    tip: 'Las reseñas con fotos tienen más impacto para otros compradores.',
  },
];

const PAYMENT_METHODS = [
  { name: 'Visa', logo: '💳', desc: 'Hasta 12 cuotas sin interés' },
  { name: 'Mastercard', logo: '💳', desc: 'Hasta 12 cuotas sin interés' },
  { name: 'American Express', logo: '💳', desc: 'Hasta 6 cuotas sin interés' },
  { name: 'Billetera MS', logo: '📱', desc: 'Pago instantáneo con saldo' },
  { name: 'Transferencia', logo: '🏦', desc: 'Pago directo desde tu banco' },
  { name: 'Efectivo', logo: '💵', desc: 'En puntos de pago habilitados' },
];

export default function ComoComprarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-ms-blue to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black mb-4">¿Cómo comprar en Mercado Simple?</h1>
          <p className="text-white/80 text-xl mb-8">Comprá de forma fácil, rápida y segura en 5 pasos</p>
          <Link href="/productos" className="inline-flex items-center gap-2 bg-ms-yellow text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition">
            Empezar a comprar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* STEPS */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">El proceso paso a paso</h2>
          <div className="space-y-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-ms-blue text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                      {step.number}
                    </div>
                    {i < STEPS.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-3" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-ms-blue" />
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{step.desc}</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-700">
                      💡 {step.tip}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* MÉTODOS DE PAGO */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Métodos de pago disponibles</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map((pm, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <div className="text-3xl mb-2">{pm.logo}</div>
                <p className="font-semibold text-gray-900 text-sm">{pm.name}</p>
                <p className="text-gray-500 text-xs mt-1">{pm.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* GARANTÍAS */}
        <section className="bg-green-50 rounded-2xl border border-green-100 p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-10 h-10 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu compra siempre está protegida</h2>
              <p className="text-gray-600 mb-4">Si no recibís lo que compraste o el producto no coincide con la descripción, te devolvemos el dinero. Sin preguntas, sin complicaciones.</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {['30 días para realizar devoluciones', 'Reembolso garantizado', 'Mediación de conflictos gratuita', 'Envío de devolución gratis'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/proteccion-comprador" className="mt-4 inline-block text-green-700 font-semibold hover:underline text-sm">
                Leer más sobre Compra Protegida →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
