'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Shield, CheckCircle, AlertCircle, Scale, Phone, ChevronRight, ExternalLink } from 'lucide-react';

const RIGHTS = [
  { icon: '🔍', title: 'Información completa y veraz', desc: 'Tenés derecho a recibir información clara sobre precio, características, origen y posibles riesgos del producto o servicio.' },
  { icon: '↩️', title: 'Derecho de retracto (10 días hábiles)', desc: 'Podés cancelar cualquier compra online dentro de los 10 días hábiles desde la entrega, sin costo ni justificación.' },
  { icon: '🛡️', title: 'Garantía legal obligatoria', desc: 'Todo producto nuevo tiene garantía legal mínima de 6 meses (3 meses para usados). Los defectos de fábrica deben ser reparados o el producto reemplazado.' },
  { icon: '💰', title: 'Precio justo', desc: 'No se pueden aplicar costos adicionales no informados al momento de la compra. El precio mostrado es el precio final.' },
  { icon: '📋', title: 'Contrato claro', desc: 'Los términos y condiciones deben ser legibles, accesibles y comprensibles. Las cláusulas abusivas no tienen validez.' },
  { icon: '⚖️', title: 'Recurso ante organismos', desc: 'Podés presentar reclamos ante la Dirección Nacional de Defensa del Consumidor o la Secretaría de Comercio.' },
];

const HOW_WE_HELP = [
  { step: '1', title: 'Mediación directa', desc: 'Primero intentamos resolver el conflicto entre comprador y vendedor directamente en la plataforma.' },
  { step: '2', title: 'Revisión del equipo', desc: 'Si no se resuelve, nuestro equipo de atención al cliente revisa el caso y toma una decisión.' },
  { step: '3', title: 'Resolución garantizada', desc: 'Si el reclamo es válido, procesamos el reembolso o tomamos acción sobre el vendedor.' },
  { step: '4', title: 'Escalación externa', desc: 'Si no logramos resolverlo, te orientamos para presentar tu reclamo ante organismos oficiales.' },
];

const OFFICIAL_ORGANISMS = [
  { name: 'DNDC - Defensa del Consumidor', url: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor', desc: 'Dirección Nacional de Defensa del Consumidor y Arbitraje del Consumo' },
  { name: 'Sistema Nacional de Arbitraje', url: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor/arbitraje', desc: 'Resolución rápida y gratuita de conflictos de consumo' },
  { name: 'Consumidores Argentina', url: 'https://www.consumidoresarg.com.ar', desc: 'Organización de consumidores independiente' },
  { name: 'Defensa del Consumidor GBA', url: 'https://www.gba.gob.ar/defensa-del-consumidor', desc: 'Para residentes de la Provincia de Buenos Aires' },
];

const LAWS = [
  { num: 'Ley 24.240', desc: 'Ley de Defensa del Consumidor — protege al consumidor en todas las relaciones de consumo.' },
  { num: 'Ley 25.065', desc: 'Tarjetas de Crédito — regula el uso y las condiciones de las tarjetas.' },
  { num: 'Ley 26.361', desc: 'Modifica y amplía la Ley 24.240, extendiéndola a más relaciones de consumo.' },
  { num: 'Ley 27.250', desc: 'Actualiza garantías legales para electrodomésticos y artículos del hogar.' },
  { num: 'Res. 37/2019', desc: 'Contratación electrónica — regula el comercio electrónico en Argentina.' },
];

export default function DefensaConsumidorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Defensa del Consumidor</h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Conocé tus derechos como consumidor en Argentina y cómo Mercado Simple los garantiza en cada compra.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Tus derechos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Tus derechos como consumidor</h2>
          <p className="text-gray-500 text-center mb-8">Basados en la Ley 24.240 y normativas vigentes en Argentina.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {RIGHTS.map((r) => (
              <div key={r.title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{r.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-500">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo protegemos */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Cómo Mercado Simple protege tus derechos
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOW_WE_HELP.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{item.step}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Derecho de retracto */}
        <section className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-orange-900 mb-3 flex items-center gap-2">
            ↩️ Derecho de retracto — Art. 34 Ley 24.240
          </h2>
          <p className="text-orange-800 mb-4">
            Para compras realizadas fuera del establecimiento comercial (incluyendo internet), el consumidor tiene el derecho irrenunciable de revocar la aceptación dentro de los <strong>10 días hábiles</strong> contados desde la entrega del producto.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <p className="text-sm font-semibold text-green-700">✓ Incluye</p>
              <ul className="text-xs text-gray-600 space-y-1 mt-1">
                <li>• Compras por internet o teléfono</li>
                <li>• Cualquier producto físico nuevo</li>
                <li>• Sin necesidad de dar explicaciones</li>
                <li>• Devolución del precio pagado íntegro</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <p className="text-sm font-semibold text-red-700">✕ No incluye</p>
              <ul className="text-xs text-gray-600 space-y-1 mt-1">
                <li>• Productos perecederos o con uso</li>
                <li>• Software activado o licencias</li>
                <li>• Servicios ya ejecutados</li>
                <li>• Productos personalizados</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Marco legal */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" /> Marco legal vigente
          </h2>
          <div className="space-y-3">
            {LAWS.map((law) => (
              <div key={law.num} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-indigo-600 flex-shrink-0 min-w-[80px]">{law.num}</span>
                <p className="text-sm text-gray-700">{law.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Organismos oficiales */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Organismos donde podés reclamar</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {OFFICIAL_ORGANISMS.map((org) => (
              <a key={org.name} href={org.url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{org.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{org.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/devoluciones" className="flex-1 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-center hover:bg-indigo-700 transition-colors">
            Solicitar devolución
          </Link>
          <Link href="/proteccion-comprador" className="flex-1 border border-indigo-600 text-indigo-600 font-semibold px-6 py-3 rounded-xl text-center hover:bg-indigo-50 transition-colors">
            Compra Protegida
          </Link>
          <Link href="/contacto" className="flex-1 border border-gray-300 text-gray-600 font-semibold px-6 py-3 rounded-xl text-center hover:bg-gray-50 transition-colors">
            Contactar soporte
          </Link>
        </div>
      </div>
    </div>
  );
}
