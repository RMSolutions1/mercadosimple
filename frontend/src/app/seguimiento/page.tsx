'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Search, Truck, MapPin, Clock, ChevronRight, AlertCircle } from 'lucide-react';

const RECENT_EXAMPLES = ['MS-2024-001234', 'MS-2024-005678', 'MS-2024-009012'];

export default function SeguimientoLandingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = trackingNumber.trim().toUpperCase();
    if (!num) { setError('Ingresá un número de seguimiento'); return; }
    if (num.length < 6) { setError('El número de seguimiento debe tener al menos 6 caracteres'); return; }
    router.push(`/seguimiento/${encodeURIComponent(num)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ms-blue to-blue-700 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Seguimiento de envío</h1>
          <p className="text-blue-100 text-lg mb-8">
            Rastreá tu pedido en tiempo real. Sabé exactamente dónde está tu compra.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => { setTrackingNumber(e.target.value); setError(''); }}
                  placeholder="Ej: MS-2024-001234"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-ms-blue text-base font-mono"
                />
              </div>
              <button type="submit" className="bg-ms-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                <Search className="w-4 h-4" /> Rastrear
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1.5 text-left">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </form>

          {/* Ejemplos */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-blue-200 text-sm">Ejemplos:</span>
            {RECENT_EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => setTrackingNumber(ex)} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-mono transition-colors">
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

        {/* Cómo encontrar el número */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-ms-blue" /> ¿Dónde encontrar tu número de seguimiento?
          </h2>
          <div className="space-y-3">
            {[
              { icon: '📧', text: 'En el email de confirmación que recibiste al comprar' },
              { icon: '📱', text: 'En la sección "Mis pedidos" de tu perfil' },
              { icon: '🔔', text: 'En la notificación de envío que recibiste' },
              { icon: '💬', text: 'En el chat con el vendedor' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Estados posibles */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ms-blue" /> Estados del envío
          </h2>
          <div className="space-y-3">
            {[
              { icon: '📦', status: 'Preparando pedido', desc: 'El vendedor está empacando tu producto.', color: 'bg-yellow-100 text-yellow-700' },
              { icon: '🏭', status: 'En depósito', desc: 'Tu paquete está en el depósito logístico.', color: 'bg-blue-100 text-blue-700' },
              { icon: '🚚', status: 'En camino', desc: 'Tu paquete está siendo transportado.', color: 'bg-indigo-100 text-indigo-700' },
              { icon: '📍', status: 'En sucursal cercana', desc: 'Llegó a una sucursal cerca de tu domicilio.', color: 'bg-purple-100 text-purple-700' },
              { icon: '🛵', status: 'En reparto', desc: 'El mensajero está llevando el paquete a tu puerta.', color: 'bg-orange-100 text-orange-700' },
              { icon: '✅', status: 'Entregado', desc: 'Tu paquete fue entregado exitosamente.', color: 'bg-green-100 text-green-700' },
            ].map((s) => (
              <div key={s.status} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ayuda */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-ms-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">¿Problemas con tu envío?</p>
            <p className="text-sm text-blue-700 mt-1">Si tu pedido lleva más de 7 días sin actualización, podés abrir una disputa desde Mis pedidos o contactar al soporte.</p>
            <div className="flex gap-3 mt-3">
              <Link href="/perfil/pedidos" className="text-sm text-ms-blue font-semibold hover:underline">Mis pedidos →</Link>
              <Link href="/ayuda" className="text-sm text-ms-blue font-semibold hover:underline">Centro de ayuda →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
