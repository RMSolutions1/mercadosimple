'use client';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Leaf, Recycle, Package, Truck } from 'lucide-react';

export default function SustentabilidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-violet-600 hover:underline mb-6 inline-block">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Sustentabilidad</h1>
        <p className="text-gray-600 mb-10">
          Mercado Simple impulsa prácticas responsables en logística y empaquetado, y apoya a vendedores que eligen opciones más eficientes.
        </p>
        <ul className="space-y-6">
          {[
            { icon: Package, title: 'Empaques', text: 'Recomendamos reutilizar cajas y reducir plásticos de un solo uso en envíos.' },
            { icon: Truck, title: 'Logística', text: 'Agrupar envíos y elegir puntos de retiro ayuda a bajar la huella de reparto.' },
            { icon: Recycle, title: 'Economía circular', text: 'El marketplace favorece la compraventa de productos usados y reacondicionados.' },
            { icon: Leaf, title: 'Compromiso', text: 'Seguimos incorporando criterios ambientales en herramientas para vendedores.' },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <Icon className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 mt-1">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
