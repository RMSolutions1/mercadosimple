'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Users, Target, Heart, Globe, Award, TrendingUp, MapPin } from 'lucide-react';

const STATS = [
  { value: '+2M', label: 'Usuarios registrados' },
  { value: '+500K', label: 'Productos publicados' },
  { value: '23', label: 'Provincias con cobertura' },
  { value: '+15K', label: 'Vendedores activos' },
];

const VALUES = [
  { icon: '🤝', title: 'Confianza', desc: 'Construimos relaciones basadas en la transparencia entre compradores, vendedores y la plataforma.' },
  { icon: '⚡', title: 'Innovación', desc: 'Incorporamos tecnología de punta para ofrecer la mejor experiencia de compraventa del mercado.' },
  { icon: '🌍', title: 'Inclusión', desc: 'Democratizamos el comercio electrónico para que todos los argentinos puedan comprar y vender.' },
  { icon: '🛡️', title: 'Seguridad', desc: 'Protegemos cada transacción con los más altos estándares de seguridad financiera y de datos.' },
  { icon: '🌱', title: 'Sustentabilidad', desc: 'Comprometidos con prácticas responsables y el impacto positivo en las comunidades donde operamos.' },
  { icon: '❤️', title: 'Comunidad', desc: 'Fomentamos el crecimiento de pymes, emprendedores y vendedores independientes de toda Argentina.' },
];

const TEAM = [
  { name: 'Martín Rodríguez', role: 'CEO & Co-founder', avatar: 'MR', bg: 'bg-blue-500' },
  { name: 'Laura Fernández', role: 'CTO & Co-founder', avatar: 'LF', bg: 'bg-purple-500' },
  { name: 'Diego González', role: 'CPO — Producto', avatar: 'DG', bg: 'bg-green-500' },
  { name: 'Ana Martínez', role: 'CFO — Finanzas', avatar: 'AM', bg: 'bg-orange-500' },
  { name: 'Carlos Pérez', role: 'COO — Operaciones', avatar: 'CP', bg: 'bg-red-500' },
  { name: 'Valentina López', role: 'CMO — Marketing', avatar: 'VL', bg: 'bg-pink-500' },
];

const MILESTONES = [
  { year: '2020', event: 'Fundación de Mercado Simple en Buenos Aires' },
  { year: '2021', event: 'Lanzamiento de la billetera virtual y primeros 100K usuarios' },
  { year: '2022', event: 'Expansión a todas las provincias argentinas' },
  { year: '2023', event: 'Superamos 1 millón de transacciones y 500K usuarios' },
  { year: '2024', event: 'Lanzamiento de Mercado Simple Pro para empresas' },
  { year: '2025', event: 'Serie B: $50M USD de inversión. 2M usuarios.' },
];

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ms-blue to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Quiénes somos</h1>
          <p className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed">
            Somos la plataforma de comercio electrónico más importante de Argentina, construida por argentinos para argentinos.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-ms-blue">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* Misión */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="w-12 h-12 bg-ms-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-ms-blue" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestra misión</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Democratizar el comercio electrónico en Argentina, conectando a millones de compradores con vendedores de todo el país a través de una plataforma simple, segura y confiable.
          </p>
        </section>

        {/* Historia */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-ms-blue" /> Nuestra historia
          </h2>
          <div className="space-y-4">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-ms-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{m.year.slice(2)}</div>
                  {i < MILESTONES.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-2" />}
                </div>
                <div className="pt-2">
                  <span className="text-sm font-bold text-ms-blue">{m.year}</span>
                  <p className="text-gray-700 text-sm mt-0.5">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Valores */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nuestros valores</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="font-semibold text-gray-900 mt-3 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Equipo */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nuestro equipo directivo</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 ${member.bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>{member.avatar}</div>
                <div>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/trabaja-con-nosotros" className="bg-ms-blue text-white font-semibold px-6 py-3 rounded-xl text-center hover:bg-blue-700 transition-colors">
            Trabajá con nosotros
          </Link>
          <Link href="/prensa" className="border border-ms-blue text-ms-blue font-semibold px-6 py-3 rounded-xl text-center hover:bg-blue-50 transition-colors">
            Sala de prensa
          </Link>
          <Link href="/contacto" className="border border-gray-300 text-gray-600 font-semibold px-6 py-3 rounded-xl text-center hover:bg-gray-50 transition-colors">
            Contáctanos
          </Link>
        </div>
      </div>
    </div>
  );
}
