'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { DollarSign, CheckCircle, Info, ChevronRight, TrendingUp } from 'lucide-react';

const COMMISSION_TABLE = [
  { category: 'Electrónica y Tecnología', free: '0%', classic: '8%', premium: '15%' },
  { category: 'Smartphones y Celulares', free: '0%', classic: '8%', premium: '15%' },
  { category: 'Computación', free: '0%', classic: '8%', premium: '15%' },
  { category: 'Televisores y Audio', free: '0%', classic: '8%', premium: '15%' },
  { category: 'Gaming', free: '0%', classic: '8%', premium: '15%' },
  { category: 'Electrodomésticos', free: '0%', classic: '10%', premium: '16%' },
  { category: 'Moda y Ropa', free: '0%', classic: '12%', premium: '18%' },
  { category: 'Calzado', free: '0%', classic: '12%', premium: '18%' },
  { category: 'Hogar y Deco', free: '0%', classic: '10%', premium: '16%' },
  { category: 'Muebles', free: '0%', classic: '10%', premium: '16%' },
  { category: 'Deportes', free: '0%', classic: '10%', premium: '16%' },
  { category: 'Juguetes y Bebés', free: '0%', classic: '10%', premium: '16%' },
  { category: 'Libros y Música', free: '0%', classic: '7%', premium: '13%' },
  { category: 'Salud y Belleza', free: '0%', classic: '10%', premium: '16%' },
  { category: 'Alimentos y Bebidas', free: '0%', classic: '8%', premium: '14%' },
  { category: 'Servicios', free: '0%', classic: '5%', premium: '10%' },
  { category: 'Autos y Motos (accesorios)', free: '0%', classic: '8%', premium: '15%' },
  { category: 'Inmuebles (publicaciones)', free: '0%', classic: '5%', premium: '10%' },
];

const PLAN_DETAILS = [
  {
    name: 'Gratuita',
    price: '0% comisión',
    color: 'gray',
    features: [
      '1 publicación activa a la vez',
      'Sin visibilidad adicional en búsquedas',
      'Sin cuotas en tarjeta (pago al contado)',
      'Sin envío por Mercado Simple',
      'Ideal para probar la plataforma',
    ],
    limitations: ['1 foto por publicación', 'Sin estadísticas avanzadas'],
  },
  {
    name: 'Clásica',
    price: '8–12% según categoría',
    color: 'blue',
    highlighted: false,
    features: [
      'Publicaciones ilimitadas',
      'Posicionamiento normal en búsquedas',
      'Hasta 6 cuotas sin interés con bancos adheridos',
      'Envío por red logística de Mercado Simple',
      'Hasta 8 fotos por publicación',
      'Estadísticas básicas de ventas',
    ],
    limitations: [],
  },
  {
    name: 'Premium',
    price: '13–18% según categoría',
    color: 'green',
    highlighted: true,
    features: [
      'Publicaciones ilimitadas',
      'Mayor posicionamiento en búsquedas (hasta x3)',
      'Hasta 12 cuotas sin interés con todos los bancos',
      'Envío gratis por Mercado Simple (según zona)',
      'Hasta 20 fotos + video por publicación',
      'Estadísticas avanzadas y comparativas',
      'Soporte prioritario 24/7',
      'Badge "Vendedor Premium" en tu perfil',
    ],
    limitations: [],
  },
];

const EXAMPLE = [
  { plan: 'Gratuita', sale: 10000, commission: 0, net: 10000 },
  { plan: 'Clásica', sale: 10000, commission: 800, net: 9200 },
  { plan: 'Premium', sale: 10000, commission: 1500, net: 8500 },
];

export default function ComisionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Comisiones y planes</h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Solo pagás cuando vendés. Sin costos fijos, sin sorpresas. Elegí el plan que más te conviene.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Planes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Planes de publicación</h2>
          <p className="text-gray-500 text-center mb-8">Todos los planes incluyen acceso a millones de compradores.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLAN_DETAILS.map((plan) => (
              <div key={plan.name} className={`rounded-xl border-2 p-5 bg-white ${plan.highlighted ? 'border-green-500 shadow-lg' : 'border-gray-200'}`}>
                {plan.highlighted && <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">⭐ Más popular</div>}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-lg font-bold text-indigo-600 my-2">{plan.price}</p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                {plan.limitations.length > 0 && (
                  <ul className="space-y-1 border-t pt-3">
                    {plan.limitations.map((l) => (
                      <li key={l} className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="w-3 h-3 flex-shrink-0">—</span> {l}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Ejemplo de cálculo */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Ejemplo práctico: venta de $10.000
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-semibold">Plan</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">Precio de venta</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">Comisión</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">Lo que cobrás</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLE.map((e) => (
                  <tr key={e.plan} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{e.plan}</td>
                    <td className="py-3 text-right text-gray-700">${e.sale.toLocaleString('es-AR')}</td>
                    <td className="py-3 text-right text-red-500">-${e.commission.toLocaleString('es-AR')}</td>
                    <td className="py-3 text-right font-bold text-green-600">${e.net.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> Los importes no incluyen IVA ni retenciones impositivas según corresponda.
          </p>
        </section>

        {/* Tabla por categoría */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Comisiones por categoría</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Categoría</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold">Gratuita</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold">Clásica</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_TABLE.map((row, i) => (
                    <tr key={row.category} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-800 font-medium">{row.category}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{row.free}</td>
                      <td className="px-4 py-3 text-center text-indigo-600 font-semibold">{row.classic}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-indigo-600 text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2">¿Empezás a vender hoy?</h2>
          <p className="text-indigo-100 mb-5">Registrate gratis y publicá tu primer producto en minutos.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/empezar-a-vender" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              Empezar a vender
            </Link>
            <Link href="/como-vender" className="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Cómo funciona
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
