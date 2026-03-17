import Link from 'next/link';
import { Shield, CheckCircle, Clock, RotateCcw, Truck, CreditCard, AlertCircle } from 'lucide-react';

export default function ProteccionCompradorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-ms-yellow" />
          <h1 className="text-4xl font-black mb-4">Compra Protegida</h1>
          <p className="text-white/80 text-xl">Tu dinero está seguro hasta que recibas exactamente lo que compraste</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* PROMESAS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: CheckCircle, title: 'Recibís lo que compraste', desc: 'Si el producto no llega o no coincide con la descripción, te devolvemos el dinero.', color: 'text-green-600' },
            { icon: Clock, title: '30 días de garantía', desc: 'Tenés 30 días desde que recibís el producto para iniciar una devolución sin dar explicaciones.', color: 'text-blue-600' },
            { icon: RotateCcw, title: 'Devolución gratis', desc: 'Si el producto no es lo que esperabas, el costo del envío de devolución corre por nuestra cuenta.', color: 'text-purple-600' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <Icon className={`w-12 h-12 ${item.color} mx-auto mb-3`} />
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </section>

        {/* ¿CÓMO FUNCIONA? */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Comprás con tranquilidad', desc: 'Tu pago queda retenido hasta que confirmás que recibiste el producto correctamente.' },
              { step: 2, title: 'Recibís el producto', desc: 'Una vez entregado, tenés 3 días para confirmarlo o reportar un problema.' },
              { step: 3, title: 'Si hay algún problema', desc: 'Podés abrir un reclamo desde "Mis compras". Mediamos entre vos y el vendedor.' },
              { step: 4, title: 'Resolución garantizada', desc: 'Si no llegamos a un acuerdo, analizamos el caso y tomamos una decisión en 5 días hábiles.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COBERTURA */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Qué cubre la Compra Protegida?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cubierto</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {['El producto no llegó', 'El producto es diferente a la descripción', 'El producto llegó dañado', 'Recibiste un producto falso', 'Falta algún componente del producto'].map((i, k) => (
                  <li key={k} className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> {i}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> No cubierto</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {['Cambio de opinión después de 30 días', 'Daños causados por el comprador', 'Productos de segunda mano con desgaste normal', 'Acuerdos fuera de la plataforma'].map((i, k) => (
                  <li key={k} className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-red-400" /> {i}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/ayuda" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">
            ¿Más preguntas? Centro de ayuda
          </Link>
        </div>
      </div>
    </div>
  );
}
