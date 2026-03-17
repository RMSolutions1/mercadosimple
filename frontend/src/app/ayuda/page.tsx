'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, ShoppingCart, CreditCard, Truck, RotateCcw, Shield, MessageCircle,
  User, Package, ChevronRight, ChevronDown, Phone, Mail, Clock,
} from 'lucide-react';

const CATEGORIES = [
  { icon: ShoppingCart, title: 'Comprar', color: 'bg-blue-100 text-blue-600', items: ['Cómo buscar productos', 'Agregar al carrito', 'Proceso de compra', 'Compra protegida'] },
  { icon: CreditCard, title: 'Pagos', color: 'bg-green-100 text-green-600', items: ['Medios de pago disponibles', 'Pagar con la billetera', 'Cuotas sin interés', 'Factura de compra'] },
  { icon: Truck, title: 'Envíos', color: 'bg-orange-100 text-orange-600', items: ['Tipos de envío', 'Rastrear mi envío', 'Envío gratis', 'Cambiar dirección'] },
  { icon: RotateCcw, title: 'Devoluciones', color: 'bg-red-100 text-red-600', items: ['Cómo devolver un producto', 'Plazos de devolución', 'Reembolso de dinero', 'Garantía de compra'] },
  { icon: User, title: 'Mi cuenta', color: 'bg-purple-100 text-purple-600', items: ['Crear cuenta', 'Cambiar contraseña', 'Datos personales', 'Seguridad de cuenta'] },
  { icon: Package, title: 'Vender', color: 'bg-yellow-100 text-yellow-600', items: ['Empezar a vender', 'Publicar productos', 'Gestionar ventas', 'Cobros y comisiones'] },
];

const FAQS = [
  {
    q: '¿Cómo puedo rastrear mi pedido?',
    a: 'Podés rastrear tu pedido desde "Mis compras" en tu perfil. También podés ingresar el número de seguimiento directamente en mercadosimple.com.ar/seguimiento/[número].',
  },
  {
    q: '¿Cuánto demora el envío?',
    a: 'Los tiempos de entrega varían según tu ubicación y el tipo de envío. El envío estándar tarda entre 3 a 7 días hábiles. Si el producto tiene envío Full, puede llegar al día siguiente.',
  },
  {
    q: '¿Cómo pago con la billetera?',
    a: 'Al momento del checkout, seleccioná "Pago Simple — Mi billetera" como método de pago. Debés tener saldo suficiente. Podés cargar saldo desde Pago Simple → Cargar saldo, con tarjeta o transferencia.',
  },
  {
    q: '¿Qué hago si recibo un producto defectuoso?',
    a: 'Tenés hasta 30 días desde la recepción para iniciar una devolución. Desde "Mis compras" → "Detalle del pedido" → "Reportar problema". Te guiaremos durante todo el proceso.',
  },
  {
    q: '¿Cómo contacto al vendedor?',
    a: 'Podés contactar al vendedor desde la página del producto haciendo clic en "Preguntar" o desde el chat de Mercado Simple. También podés ver sus respuestas a preguntas anteriores en la sección Q&A del producto.',
  },
  {
    q: '¿Es seguro comprar en Mercado Simple?',
    a: 'Sí. Todas las compras están protegidas por nuestra garantía de devolución. Tu información de pago está encriptada y nunca compartimos tus datos con terceros.',
  },
];

export default function AyudaPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-ms-blue to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black mb-3">¿En qué podemos ayudarte?</h1>
          <p className="text-white/80 text-lg mb-8">Encontrá respuestas a las preguntas más frecuentes</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* CATEGORÍAS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorar por tema</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer group">
                  <div className={`inline-flex p-3 rounded-xl mb-3 ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-ms-blue transition">{cat.title}</h3>
                  <ul className="space-y-1">
                    {cat.items.map((item, j) => (
                      <li key={j} className="text-sm text-gray-600 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-gray-400" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No encontramos resultados para "{search}"
              </div>
            )}
          </div>
        </section>

        {/* CONTACTO */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Todavía necesitás ayuda?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: MessageCircle, title: 'Chat en vivo', desc: 'Chateá con uno de nuestros agentes', action: 'Iniciar chat', color: 'bg-green-50 border-green-200' },
              { icon: Mail, title: 'Email', desc: 'ayuda@mercadosimple.com.ar', action: 'Enviar email', color: 'bg-blue-50 border-blue-200' },
              { icon: Clock, title: 'Horario de atención', desc: 'Lunes a viernes de 9 a 18hs', action: null, color: 'bg-gray-50 border-gray-200' },
            ].map((contact, i) => {
              const Icon = contact.icon;
              return (
                <div key={i} className={`rounded-xl border p-5 ${contact.color}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-gray-700" />
                    <h3 className="font-bold text-gray-900">{contact.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{contact.desc}</p>
                  {contact.action && (
                    <button className="text-sm font-semibold text-ms-blue hover:underline">{contact.action}</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
