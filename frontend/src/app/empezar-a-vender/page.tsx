'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Star, TrendingUp, Package, Users, DollarSign, Shield, ChevronRight, Zap } from 'lucide-react';

const REQUIREMENTS = [
  'Ser mayor de 18 años',
  'Tener DNI argentino o CUIT/CUIL vigente',
  'Cuenta bancaria o billetera virtual para recibir pagos',
  'Email y número de teléfono verificados',
];

const BENEFITS = [
  { icon: '💰', title: 'Cobrás seguro', desc: 'El dinero se acredita automáticamente en tu billetera o cuenta bancaria una vez confirmada la entrega.' },
  { icon: '📦', title: 'Envíos simples', desc: 'Usá nuestra red logística o coordiná el envío directamente con el comprador.' },
  { icon: '📊', title: 'Panel de control', desc: 'Gestioná tus ventas, productos, mensajes y estadísticas desde un solo lugar.' },
  { icon: '🌎', title: 'Alcance nacional', desc: 'Llegá a compradores de todo el país sin pagar publicidad.' },
  { icon: '🛡️', title: 'Protección vendedor', desc: 'Nuestras políticas protegen al vendedor ante disputas injustificadas.' },
  { icon: '⚡', title: 'Sin stock mínimo', desc: 'Podés vender desde 1 unidad. Ideal para emprendedores y negocios de todos los tamaños.' },
];

const PLANS = [
  { name: 'Gratuita', price: 'Sin comisión', desc: 'Para empezar', features: ['1 publicación activa', 'Sin visibilidad destacada', 'Apto para todos los vendedores'], highlighted: false },
  { name: 'Clásica', price: '8% por venta', desc: 'Para crecer', features: ['Publicaciones ilimitadas', 'Visibilidad normal en búsquedas', 'Estadísticas básicas'], highlighted: true },
  { name: 'Premium', price: '15% por venta', desc: 'Para escalar', features: ['Publicaciones ilimitadas', 'Mayor visibilidad y posicionamiento', 'Estadísticas avanzadas', 'Soporte prioritario'], highlighted: false },
];

const STEPS = [
  { num: 1, title: 'Creá tu cuenta', desc: 'Registrate gratis en menos de 2 minutos con tu email.' },
  { num: 2, title: 'Verificá tu identidad', desc: 'Completá tus datos personales y verificá tu cuenta para mayor confianza.' },
  { num: 3, title: 'Publicá tu primer producto', desc: 'Subí fotos, describí el producto y fijá el precio. ¡Es muy fácil!' },
  { num: 4, title: 'Recibí tu primera venta', desc: 'Los compradores te contactarán. Gestioná el envío y cobrá tu dinero.' },
];

export default function EmpezarAVenderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> Empezá en menos de 5 minutos
          </div>
          <h1 className="text-4xl font-bold mb-4">Empezá a vender en Mercado Simple</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto mb-8">
            Millones de compradores te esperan. Publicá tus productos gratis y empezá a generar ingresos desde hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/registro?role=seller" className="bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors text-lg">
              Crear cuenta de vendedor
            </Link>
            <Link href="/como-vender" className="border-2 border-white text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Ver más detalles
            </Link>
          </div>
          <p className="text-green-200 text-sm mt-4">¿Ya tenés cuenta? <Link href="/auth/login" className="underline text-white">Iniciá sesión aquí</Link></p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Pasos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Empezar es muy fácil</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm relative">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">{step.num}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">¿Por qué vender en Mercado Simple?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <span className="text-3xl mb-3 block">{b.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requisitos */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Requisitos para vender
          </h2>
          <ul className="space-y-3">
            {REQUIREMENTS.map((req) => (
              <li key={req} className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </section>

        {/* Planes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Planes de publicación</h2>
          <p className="text-gray-500 text-center mb-8">Solo pagás comisión cuando vendés. Sin costos fijos.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-xl border-2 p-5 ${plan.highlighted ? 'border-green-500 shadow-md' : 'border-gray-200 bg-white'}`}>
                {plan.highlighted && <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Más popular</div>}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-green-600 my-2">{plan.price}</p>
                <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center mt-4">
            <Link href="/comisiones" className="text-ms-blue hover:underline text-sm font-medium">Ver tabla completa de comisiones →</Link>
          </p>
        </section>

        {/* CTA final */}
        <div className="text-center bg-green-600 text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">¿Todo listo? Empezá ahora</h2>
          <p className="text-green-100 mb-5">Creá tu cuenta gratis y publicá tu primer producto hoy.</p>
          <Link href="/auth/registro?role=seller" className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors text-lg">
            Registrarme como vendedor <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
