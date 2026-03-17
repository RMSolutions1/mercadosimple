'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, ChevronRight, Star, Heart, Users, Zap } from 'lucide-react';

const BENEFITS = [
  { icon: '🏥', title: 'Salud prepaga', desc: 'Cobertura médica para vos y tu familia.' },
  { icon: '💰', title: 'Equity', desc: 'Participación en el crecimiento de la empresa.' },
  { icon: '🏠', title: 'Home office', desc: 'Modalidad híbrida: 3 días desde casa.' },
  { icon: '📚', title: 'Aprendizaje continuo', desc: 'Budget anual para cursos y certificaciones.' },
  { icon: '🌴', title: 'Vacaciones extras', desc: '18 días de vacaciones desde el primer año.' },
  { icon: '🍕', title: 'Almuerzo cubierto', desc: 'Vianda o ticket restó para días de oficina.' },
  { icon: '🎯', title: 'Bonus por objetivos', desc: 'Bonificación semestral según performance.' },
  { icon: '💻', title: 'Equipo top', desc: 'Laptop de última generación + setup completo.' },
];

const OPENINGS = [
  { area: 'Tecnología', title: 'Senior Frontend Engineer (React/Next.js)', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
  { area: 'Tecnología', title: 'Backend Engineer (Node.js/NestJS)', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
  { area: 'Tecnología', title: 'Data Engineer', type: 'Full-time', mode: 'Remoto', location: 'Argentina' },
  { area: 'Tecnología', title: 'DevOps / SRE', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
  { area: 'Producto', title: 'Product Manager — Billetera', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
  { area: 'Producto', title: 'UX Designer Senior', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
  { area: 'Marketing', title: 'Growth Hacker', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
  { area: 'Marketing', title: 'Social Media Manager', type: 'Full-time', mode: 'Remoto', location: 'Argentina' },
  { area: 'Operaciones', title: 'Analista de Fraude y Riesgo', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
  { area: 'Operaciones', title: 'Atención al cliente (Bilingüe)', type: 'Part-time', mode: 'Remoto', location: 'Argentina' },
  { area: 'Finanzas', title: 'Controller de Gestión', type: 'Full-time', mode: 'Híbrido', location: 'CABA' },
];

const areas = OPENINGS.map((o) => o.area).filter((v, i, a) => a.indexOf(v) === i);

export default function TrabajaConNosotrosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Trabajá con nosotros</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-6">
            Construimos el futuro del comercio electrónico argentino. Buscamos personas apasionadas que quieran cambiar la forma en que los argentinos compran y venden.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">{OPENINGS.length} posiciones abiertas</span>
            <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">Modalidad híbrida y remoto</span>
            <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">Equipo de +300 personas</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Beneficios */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">¿Por qué unirte?</h2>
          <p className="text-gray-500 text-center mb-8">Beneficios diseñados para que des lo mejor de vos.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
                <span className="text-3xl">{b.icon}</span>
                <h3 className="font-semibold text-gray-900 mt-2 mb-1 text-sm">{b.title}</h3>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Valores */}
        <section className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">Nuestra cultura</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Zap, text: 'Autonomía y confianza: priorizamos resultados, no el control.' },
              { icon: Heart, text: 'Ambiente inclusivo y diverso. Todas las voces importan.' },
              { icon: Star, text: 'Excelencia con humildad. Aprendemos de los errores.' },
              { icon: Users, text: 'Colaboración sin silos. Todos remamos para el mismo lado.' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-800">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Posiciones */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Posiciones abiertas</h2>
          {areas.map((area) => (
            <div key={area} className="mb-6">
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-5 bg-purple-500 rounded-full" /> {area}
              </h3>
              <div className="space-y-2">
                {OPENINGS.filter((o) => o.area === area).map((job) => (
                  <div key={job.title} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{job.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.mode === 'Remoto' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{job.mode}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Espontánea */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">¿No encontrás tu rol?</h3>
          <p className="text-gray-500 text-sm mb-4">Siempre buscamos talento excepcional. Mandanos tu CV y te contactaremos cuando surja algo para vos.</p>
          <a href="mailto:jobs@mercadosimple.com" className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors">
            Enviar postulación espontánea
          </a>
        </div>
      </div>
    </div>
  );
}
