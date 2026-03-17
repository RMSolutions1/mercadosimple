'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { TrendingUp, DollarSign, Users, Globe, BarChart3, Mail, Download, Shield, ChevronRight } from 'lucide-react';

const KEY_METRICS = [
  { value: '+2M', label: 'Usuarios registrados', growth: '+85% YoY' },
  { value: '$50M', label: 'Volumen mensual (USD)', growth: '+120% YoY' },
  { value: '+15K', label: 'Vendedores activos', growth: '+65% YoY' },
  { value: '23', label: 'Provincias con cobertura', growth: 'Cobertura nacional' },
  { value: '4.8★', label: 'Rating en app stores', growth: '+100K reseñas' },
  { value: '78%', label: 'Net Promoter Score', growth: 'Top 5% sector' },
];

const INVESTORS = [
  { name: 'Kaszek Ventures', type: 'Lead VC', flag: '🇦🇷🇧🇷' },
  { name: 'NXTP Labs', type: 'VC', flag: '🇦🇷' },
  { name: 'Endeavor Catalyst', type: 'Growth', flag: '🌍' },
  { name: 'Andreessen Horowitz', type: 'Series B Lead', flag: '🇺🇸' },
  { name: 'Goldman Sachs', type: 'Debt Facility', flag: '🇺🇸' },
  { name: 'IDB Invest', type: 'Impact Investor', flag: '🌍' },
];

const ROUNDS = [
  { round: 'Seed', year: '2020', amount: '$2M USD', investors: 'Ángeles y NXTP Labs' },
  { round: 'Serie A', year: '2022', amount: '$15M USD', investors: 'Kaszek + Endeavor Catalyst' },
  { round: 'Serie B', year: '2025', amount: '$50M USD', investors: 'Andreessen Horowitz + Kaszek' },
];

const FINANCIALS = [
  { year: '2022', gmv: '$85M', revenue: '$12M', users: '450K' },
  { year: '2023', gmv: '$210M', revenue: '$28M', users: '1.1M' },
  { year: '2024', gmv: '$480M', revenue: '$62M', users: '1.7M' },
  { year: '2025E', gmv: '$850M', revenue: '$110M', users: '2.5M' },
];

const DOCS = [
  { name: 'Pitch Deck 2026', desc: 'Presentación para inversores', type: 'pdf' },
  { name: 'Informe Anual 2025', desc: 'Resultados y métricas del año', type: 'pdf' },
  { name: 'Modelo Financiero', desc: 'Proyecciones 2026–2030', type: 'xlsx' },
  { name: 'Nota de prensa — Serie B', desc: 'Comunicado oficial', type: 'pdf' },
];

export default function InversoresPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Relaciones con Inversores</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Mercado Simple es la plataforma de comercio electrónico de mayor crecimiento en Argentina. Construimos el futuro del e-commerce latinoamericano.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* KPIs */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Métricas clave</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {KEY_METRICS.map((m) => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
                <p className="text-3xl font-bold text-indigo-600">{m.value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{m.label}</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">{m.growth}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Historial de rondas */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" /> Historial de inversión
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-semibold">Ronda</th>
                  <th className="text-center py-2 text-gray-600 font-semibold">Año</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">Monto</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">Inversores</th>
                </tr>
              </thead>
              <tbody>
                {ROUNDS.map((r) => (
                  <tr key={r.round} className="border-b border-gray-100">
                    <td className="py-3 font-bold text-indigo-600">{r.round}</td>
                    <td className="py-3 text-center text-gray-600">{r.year}</td>
                    <td className="py-3 text-right font-bold text-gray-900">{r.amount}</td>
                    <td className="py-3 text-right text-gray-500 text-xs">{r.investors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Financiero */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Resumen financiero
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-semibold">Año</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">GMV</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">Revenue</th>
                  <th className="text-right py-2 text-gray-600 font-semibold">Usuarios</th>
                </tr>
              </thead>
              <tbody>
                {FINANCIALS.map((f) => (
                  <tr key={f.year} className={`border-b border-gray-100 ${f.year.includes('E') ? 'text-indigo-600 font-semibold' : ''}`}>
                    <td className="py-3">{f.year}</td>
                    <td className="py-3 text-right">{f.gmv}</td>
                    <td className="py-3 text-right">{f.revenue}</td>
                    <td className="py-3 text-right">{f.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">E = Estimado. Cifras en dólares estadounidenses.</p>
        </section>

        {/* Inversores actuales */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Nuestros inversores</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INVESTORS.map((inv) => (
              <div key={inv.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                <span className="text-2xl">{inv.flag}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{inv.name}</p>
                  <p className="text-xs text-gray-500">{inv.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Documentos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentación</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {DOCS.map((doc) => (
              <div key={doc.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600 uppercase">{doc.type}</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.desc}</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">¿Interesado en invertir?</h3>
            <p className="text-gray-300 text-sm mt-1">Contactá a nuestro equipo de relaciones con inversores.</p>
          </div>
          <a href="mailto:ir@mercadosimple.com" className="flex items-center gap-2 bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">
            <Mail className="w-4 h-4" /> ir@mercadosimple.com
          </a>
        </div>
      </div>
    </div>
  );
}
