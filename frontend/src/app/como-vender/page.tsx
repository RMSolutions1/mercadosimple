import Link from 'next/link';
import { Package, DollarSign, Truck, Star, BarChart2, CheckCircle, ArrowRight } from 'lucide-react';

const STEPS = [
  { number: '01', icon: Package, title: 'Creá tu cuenta de vendedor', desc: 'Registrate o activá el modo vendedor desde tu perfil. Es gratis y en minutos.' },
  { number: '02', icon: Package, title: 'Publicá tu producto', desc: 'Tomá fotos, escribí una descripción detallada y fijá el precio. Podés publicar en minutos.' },
  { number: '03', icon: DollarSign, title: 'Recibí tu venta', desc: 'Cuando alguien compra, te avisamos al instante. El dinero queda disponible en tu billetera.' },
  { number: '04', icon: Truck, title: 'Enviá el producto', desc: 'Empaquetá el pedido e imprimí la etiqueta de envío desde tu panel. Sin complicaciones.' },
  { number: '05', icon: Star, title: 'Construí tu reputación', desc: 'Con cada venta exitosa, acumulás calificaciones que te ayudan a vender más y más rápido.' },
];

const COMMISSIONS = [
  { type: 'Publicación Gratuita', price: 'Gratis', features: ['Hasta 5 publicaciones', 'Comisión del 5%', 'Fotos incluidas', 'Soporte básico'] },
  { type: 'Publicación Clásica', price: '2.5%', features: ['Publicaciones ilimitadas', 'Comisión del 2.5%', 'Hasta 12 fotos', 'Soporte prioritario', 'Estadísticas básicas'], highlight: true },
  { type: 'Publicación Premium', price: '1.5%', features: ['Publicaciones ilimitadas', 'Comisión del 1.5%', 'Hasta 20 fotos + video', 'Soporte 24/7', 'Estadísticas avanzadas', 'Posicionamiento preferencial'] },
];

export default function ComoVenderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black mb-4">Vendé en Mercado Simple</h1>
          <p className="text-white/80 text-xl mb-8">Llegá a millones de compradores en todo el país. Es gratis, rápido y seguro.</p>
          <Link href="/auth/registro?role=seller" className="inline-flex items-center gap-2 bg-ms-yellow text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition text-lg">
            Empezar a vender <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* STEPS */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">5 pasos para tu primera venta</h2>
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center font-black flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* COMISIONES */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Planes y comisiones</h2>
          <p className="text-gray-500 text-center mb-8">Pagás solo cuando vendés. Sin cargos fijos.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMISSIONS.map((plan, i) => (
              <div key={i} className={`rounded-2xl border p-6 ${plan.highlight ? 'bg-green-600 text-white border-green-600 shadow-lg scale-105' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.type}</h3>
                <div className={`text-3xl font-black mb-4 ${plan.highlight ? 'text-ms-yellow' : 'text-green-600'}`}>{plan.price}</div>
                <ul className="space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white/90' : 'text-gray-600'}`}>
                      <CheckCircle className={`w-4 h-4 ${plan.highlight ? 'text-ms-yellow' : 'text-green-500'}`} /> {f}
                    </li>
                  ))}
                </ul>
                {plan.highlight && (
                  <Link href="/auth/registro?role=seller" className="mt-6 block text-center bg-ms-yellow text-gray-900 font-bold py-2.5 rounded-xl hover:bg-yellow-400 transition">
                    Comenzar
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="bg-blue-50 rounded-2xl border border-blue-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">¿Por qué vender en Mercado Simple?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { emoji: '🆓', title: 'Publicación gratis', desc: 'Sin costo de alta' },
              { emoji: '💰', title: 'Cobrás al instante', desc: 'Dinero en tu billetera' },
              { emoji: '📦', title: 'Envíos simples', desc: 'Gestión completa' },
              { emoji: '📊', title: 'Métricas en tiempo real', desc: 'Tomá mejores decisiones' },
            ].map((b, i) => (
              <div key={i}>
                <div className="text-3xl mb-2">{b.emoji}</div>
                <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                <p className="text-gray-500 text-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
