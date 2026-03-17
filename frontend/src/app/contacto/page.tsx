'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CONTACT_OPTIONS = [
  { icon: '💬', title: 'Chat en vivo', desc: 'Respuesta inmediata', hours: 'Lun–Vie 8–22 hs / Sáb–Dom 9–18 hs', action: 'Iniciar chat', available: true },
  { icon: '📧', title: 'Email', desc: 'Respuesta en 24–48 hs hábiles', hours: 'Disponible 24/7', action: 'soporte@mercadosimple.com', available: true },
  { icon: '📞', title: 'Teléfono', desc: 'Atención personalizada', hours: 'Lun–Vie 9–18 hs', action: '0800-888-SIMPLE', available: true },
  { icon: '🤝', title: 'Oficinas', desc: 'Atención presencial', hours: 'Lun–Vie 10–16 hs (con turno previo)', action: 'Ver dirección', available: true },
];

const TOPICS = [
  'Problema con mi pedido',
  'Devolución o reembolso',
  'Problema con un pago',
  'Mi cuenta fue suspendida',
  'Problema con mi publicación',
  'Reportar un vendedor',
  'Consulta sobre comisiones',
  'Billetera digital',
  'Otro',
];

interface FormData {
  name: string;
  email: string;
  topic: string;
  orderId: string;
  message: string;
}

export default function ContactoPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', topic: '', orderId: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.topic || !form.message) {
      toast.error('Completá todos los campos obligatorios');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success('Mensaje enviado correctamente');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ms-blue to-blue-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Contáctanos</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Elegí el canal que más te conviene.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {/* Opciones de contacto */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_OPTIONS.map((opt) => (
            <div key={opt.title} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center hover:shadow-md transition-shadow">
              <span className="text-3xl">{opt.icon}</span>
              <h3 className="font-semibold text-gray-900 mt-2 mb-1">{opt.title}</h3>
              <p className="text-sm text-ms-blue font-medium">{opt.desc}</p>
              <p className="text-xs text-gray-400 mt-1 mb-3 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> {opt.hours}
              </p>
              <button className="text-xs bg-ms-blue/10 text-ms-blue px-3 py-1.5 rounded-lg font-medium hover:bg-ms-blue/20 transition-colors w-full">
                {opt.action}
              </button>
            </div>
          ))}
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 mb-6">Te contactaremos a <strong>{form.email}</strong> en las próximas 24–48 hs hábiles.</p>
                <p className="text-sm text-gray-400 mb-4">N° de caso: <strong className="font-mono">CS-{Math.floor(Math.random() * 900000) + 100000}</strong></p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', orderId: '', message: '' }); }} className="text-ms-blue hover:underline text-sm font-medium">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-ms-blue" /> Enviar un mensaje
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema *</label>
                    <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required className="input-field">
                      <option value="">Seleccioná un tema</option>
                      {TOPICS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">N° de pedido (opcional)</label>
                    <input type="text" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="input-field font-mono" placeholder="MS-2024-XXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="input-field resize-none" placeholder="Describí tu consulta o problema con el mayor detalle posible..." />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-ms-blue text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Info adicional */}
          <div className="space-y-4">
            {/* Horarios */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-ms-blue" /> Horarios de atención</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Chat en vivo', 'Lun–Vie 8–22 hs / Sáb–Dom 9–18 hs'],
                  ['Soporte telefónico', 'Lun–Vie 9–18 hs'],
                  ['Email / Formulario', '24/7 (respuesta en 24–48 hs hábiles)'],
                  ['Oficinas (con turno)', 'Lun–Vie 10–16 hs'],
                ].map(([ch, h]) => (
                  <div key={ch} className="flex items-start justify-between gap-2">
                    <span className="text-gray-600">{ch}</span>
                    <span className="text-gray-800 font-medium text-right">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-ms-blue" /> Oficinas centrales</h3>
              <p className="text-sm text-gray-600">Av. Corrientes 1234, Piso 8</p>
              <p className="text-sm text-gray-600">C1043AAZ - Ciudad Autónoma de Buenos Aires</p>
              <p className="text-sm text-gray-600 mt-2">Argentina</p>
              <p className="text-xs text-gray-400 mt-2">* Atención presencial con turno previo</p>
            </div>

            {/* Links rápidos */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Antes de contactarnos</h3>
              <div className="space-y-2">
                {[
                  { href: '/ayuda', label: 'Centro de ayuda — FAQ' },
                  { href: '/devoluciones', label: 'Solicitar devolución' },
                  { href: '/perfil/pedidos', label: 'Ver estado de pedido' },
                  { href: '/seguimiento', label: 'Rastrear envío' },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <span className="text-sm text-gray-700">{l.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-ms-blue transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
