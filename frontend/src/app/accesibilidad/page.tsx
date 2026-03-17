'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Eye, Ear, Hand, Brain, Keyboard, Smartphone, Monitor, ChevronRight, CheckCircle, Mail } from 'lucide-react';

const FEATURES = [
  {
    icon: Eye,
    title: 'Visibilidad',
    color: 'text-blue-600 bg-blue-50',
    items: [
      'Alto contraste en textos y fondos (relación mínima 4.5:1)',
      'Modo de alto contraste disponible en configuración',
      'Textos escalables sin pérdida de funcionalidad',
      'No se usa solo color para transmitir información',
      'Imágenes con texto alternativo (alt text)',
    ],
  },
  {
    icon: Ear,
    title: 'Contenido auditivo',
    color: 'text-purple-600 bg-purple-50',
    items: [
      'Videos con subtítulos y transcripciones',
      'Alertas de audio acompañadas de señales visuales',
      'Descripción de audio para videos importantes',
    ],
  },
  {
    icon: Hand,
    title: 'Motor / Movilidad',
    color: 'text-green-600 bg-green-50',
    items: [
      'Navegación completa con teclado (Tab, Enter, Escape)',
      'Área de clic ampliada en botones y enlaces',
      'Sin límites de tiempo en formularios críticos',
      'Sin contenido que parpadee más de 3 veces por segundo',
    ],
  },
  {
    icon: Brain,
    title: 'Cognitivo',
    color: 'text-orange-600 bg-orange-50',
    items: [
      'Lenguaje claro y sencillo en toda la plataforma',
      'Instrucciones paso a paso para procesos complejos',
      'Mensajes de error descriptivos y sugerencias de corrección',
      'Consistencia en navegación y diseño entre secciones',
    ],
  },
  {
    icon: Keyboard,
    title: 'Tecnologías asistivas',
    color: 'text-red-600 bg-red-50',
    items: [
      'Compatible con lectores de pantalla (NVDA, JAWS, VoiceOver)',
      'Etiquetas ARIA para elementos dinámicos',
      'Roles semánticos correctos (button, nav, main, etc.)',
      'Anuncios de cambios de estado para lectores de pantalla',
    ],
  },
  {
    icon: Smartphone,
    title: 'Dispositivos móviles',
    color: 'text-teal-600 bg-teal-50',
    items: [
      'Diseño responsive adaptable a cualquier tamaño de pantalla',
      'Compatible con zoom hasta 400% sin pérdida de contenido',
      'Targets táctiles de al menos 44x44 píxeles',
      'Funcionalidad completa con gestos de accesibilidad del SO',
    ],
  },
];

const STANDARDS = [
  { name: 'WCAG 2.1 AA', desc: 'Web Content Accessibility Guidelines — nivel AA' },
  { name: 'ARIA 1.2', desc: 'Accessible Rich Internet Applications' },
  { name: 'Ley 26.653', desc: 'Ley Nacional de Accesibilidad Web (Argentina)' },
  { name: 'Section 508', desc: 'Estándar de accesibilidad de EE.UU. como referencia' },
];

export default function AccesibilidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Accesibilidad</h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            Mercado Simple está comprometido con hacer su plataforma accesible para todas las personas, independientemente de sus capacidades.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Declaración */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Nuestra declaración de accesibilidad</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Mercado Simple se esfuerza por garantizar que su plataforma digital sea accesible para personas con discapacidades. Hemos implementado y continuamos implementando medidas relevantes de accesibilidad, siguiendo las <strong>Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1, nivel AA</strong>.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Creemos que el comercio electrónico debe ser para todos. Por eso trabajamos continuamente para mejorar la experiencia de usuarios con discapacidad visual, auditiva, motriz o cognitiva.
          </p>
        </section>

        {/* Características de accesibilidad */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Características de accesibilidad</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color} mb-3`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <ul className="space-y-1.5">
                    {feature.items.map((item) => (
                      <li key={item} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Estándares */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Estándares y normativas que seguimos</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {STANDARDS.map((s) => (
              <div key={s.name} className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-teal-900 text-sm">{s.name}</p>
                  <p className="text-xs text-teal-700">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Atajos de teclado */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-teal-600" /> Atajos de teclado principales
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { key: 'Tab', action: 'Navegar entre elementos interactivos' },
              { key: 'Enter / Space', action: 'Activar botones y enlaces' },
              { key: 'Escape', action: 'Cerrar diálogos y menús' },
              { key: '↑ ↓', action: 'Navegar en listas y menús desplegables' },
              { key: '/', action: 'Enfocar la barra de búsqueda' },
              { key: 'Alt + 1', action: 'Ir al contenido principal' },
              { key: 'Alt + 2', action: 'Ir a la navegación' },
              { key: 'Alt + 3', action: 'Ir al pie de página' },
            ].map(({ key, action }) => (
              <div key={key} className="flex items-center gap-3 p-2">
                <kbd className="bg-gray-100 border border-gray-300 text-gray-700 text-xs font-mono px-2 py-1 rounded flex-shrink-0 min-w-[80px] text-center">{key}</kbd>
                <span className="text-sm text-gray-600">{action}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Limitaciones conocidas */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-bold text-amber-900 mb-2">⚠️ Limitaciones conocidas</h3>
          <p className="text-sm text-amber-800 mb-2">Estamos trabajando en mejorar las siguientes áreas:</p>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Algunos videos de vendedores externos pueden no tener subtítulos</li>
            <li>• El chat en tiempo real puede tener limitaciones con algunos lectores de pantalla</li>
            <li>• Las imágenes subidas por usuarios pueden carecer de descripción alternativa</li>
          </ul>
        </section>

        {/* Reportar problema */}
        <div className="bg-teal-600 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">¿Encontraste una barrera de accesibilidad?</h3>
            <p className="text-teal-100 text-sm mt-1">Ayudanos a mejorar reportando cualquier problema que encuentres.</p>
          </div>
          <a href="mailto:accesibilidad@mercadosimple.com" className="flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors whitespace-nowrap">
            <Mail className="w-4 h-4" /> Reportar problema
          </a>
        </div>
      </div>
    </div>
  );
}
