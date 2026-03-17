'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Newspaper, Download, Mail, ExternalLink, Calendar, ChevronRight } from 'lucide-react';

const NEWS = [
  { date: 'Mar 2026', source: 'Infobae', title: 'Mercado Simple alcanza los 2 millones de usuarios y desafía el dominio de MercadoLibre en Argentina', tag: 'Crecimiento' },
  { date: 'Feb 2026', source: 'La Nación', title: 'La fintech argentina que quiere ser el MercadoPago de los emprendedores', tag: 'Finanzas' },
  { date: 'Ene 2026', source: 'Forbes Argentina', title: 'Los 10 startups argentinos más prometedores de 2026 — Mercado Simple lidera el ranking de e-commerce', tag: 'Reconocimiento' },
  { date: 'Dic 2025', source: 'Clarín', title: 'Mercado Simple cierra ronda de inversión de $50 millones de dólares para expandirse a Brasil', tag: 'Inversión' },
  { date: 'Nov 2025', source: 'TN Tecno', title: 'La nueva función de pago por QR de Mercado Simple ya tiene 500.000 usuarios activos', tag: 'Producto' },
  { date: 'Oct 2025', source: 'Bloomberg Línea', title: 'E-commerce en Argentina: cómo Mercado Simple ganó cuota de mercado con foco en pymes', tag: 'Mercado' },
  { date: 'Sep 2025', source: 'Ámbito', title: 'Mercado Simple lanzó su programa de créditos para vendedores PyME', tag: 'Pymes' },
  { date: 'Jul 2025', source: 'El Cronista', title: 'La plataforma que paga en 24 horas y está revolucionando cómo cobran los vendedores online', tag: 'Vendedores' },
];

const MEDIA_KIT = [
  { name: 'Logo Mercado Simple (PNG)', size: '245 KB', type: 'zip' },
  { name: 'Logo Mercado Simple (SVG)', size: '12 KB', type: 'zip' },
  { name: 'Guía de marca y colores', size: '1.2 MB', type: 'pdf' },
  { name: 'Fotos de producto y app', size: '8.4 MB', type: 'zip' },
  { name: 'Datos y estadísticas 2025', size: '380 KB', type: 'pdf' },
  { name: 'Comunicados de prensa 2025', size: '2.1 MB', type: 'pdf' },
];

const TAG_COLORS: Record<string, string> = {
  Crecimiento: 'bg-green-100 text-green-700',
  Finanzas: 'bg-blue-100 text-blue-700',
  Reconocimiento: 'bg-yellow-100 text-yellow-700',
  Inversión: 'bg-purple-100 text-purple-700',
  Producto: 'bg-cyan-100 text-cyan-700',
  Mercado: 'bg-indigo-100 text-indigo-700',
  Pymes: 'bg-orange-100 text-orange-700',
  Vendedores: 'bg-pink-100 text-pink-700',
};

export default function PrensaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Sala de prensa</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Recursos, comunicados y cobertura mediática de Mercado Simple.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {/* Contacto de prensa */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">Contacto de prensa</p>
            <p className="text-sm text-gray-500">Para consultas de medios y entrevistas</p>
          </div>
          <a href="mailto:prensa@mercadosimple.com" className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors font-medium text-sm">
            <Mail className="w-4 h-4" /> prensa@mercadosimple.com
          </a>
        </div>

        {/* Novedades */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Últimas novedades</h2>
          <div className="space-y-3">
            {NEWS.map((n) => (
              <div key={n.title} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[n.tag] || 'bg-gray-100 text-gray-600'}`}>{n.tag}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{n.date}</span>
                      <span className="text-xs font-semibold text-gray-600">{n.source}</span>
                    </div>
                    <p className="font-medium text-gray-900 group-hover:text-ms-blue transition-colors leading-snug">{n.title}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-ms-blue flex-shrink-0 transition-colors mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media Kit */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Kit</h2>
          <p className="text-gray-500 mb-4">Descargá los recursos oficiales para uso editorial.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {MEDIA_KIT.map((item) => (
              <div key={item.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 uppercase">{item.type}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-ms-blue transition-colors">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.size}</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-300 group-hover:text-ms-blue transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* Cifras */}
        <section className="bg-slate-800 text-white rounded-xl p-6">
          <h2 className="text-xl font-bold mb-5">Mercado Simple en números</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '+2M', label: 'Usuarios activos' },
              { value: '+15K', label: 'Vendedores activos' },
              { value: '$50M', label: 'Transacciones mensuales' },
              { value: '23', label: 'Provincias con cobertura' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-ms-blue">{s.value}</p>
                <p className="text-sm text-gray-300 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/quienes-somos" className="flex-1 border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl text-center hover:bg-gray-50 transition-colors">
            Quiénes somos
          </Link>
          <Link href="/inversores" className="flex-1 border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl text-center hover:bg-gray-50 transition-colors">
            Inversores
          </Link>
          <a href="mailto:prensa@mercadosimple.com" className="flex-1 bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-center hover:bg-slate-700 transition-colors">
            Contactar prensa
          </a>
        </div>
      </div>
    </div>
  );
}
