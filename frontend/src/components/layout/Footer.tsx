import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Shield, Truck, CreditCard, Headphones, RotateCcw, ShieldCheck } from 'lucide-react';
import { SolMayo } from '@/components/ui/SolMayo';

/** Una sola grilla de navegación (evita la sensación de “doble footer” de ML con dos bloques iguales). */
const FOOTER_COLS = [
  {
    title: 'Comprar',
    links: [
      { label: 'Cómo comprar',       href: '/como-comprar' },
      { label: 'Ofertas del día',    href: '/ofertas' },
      { label: 'Compra Protegida',   href: '/proteccion-comprador' },
      { label: 'Devoluciones',       href: '/devoluciones' },
      { label: 'Seguimiento envío',  href: '/seguimiento' },
    ],
  },
  {
    title: 'Vender',
    links: [
      { label: 'Empezar a vender',   href: '/empezar-a-vender' },
      { label: 'Panel vendedor',     href: '/vendedor/dashboard' },
      { label: 'Publicar producto',  href: '/vendedor/productos/nuevo' },
      { label: 'Comisiones',         href: '/comisiones' },
      { label: 'Envíos vendedor',    href: '/envios-vendedor' },
    ],
  },
  {
    title: 'Pago Simple',
    links: [
      { label: 'Mi billetera',       href: '/mi-cuenta?tab=billetera' },
      { label: 'Cargar saldo',       href: '/mi-cuenta?tab=depositar' },
      { label: 'Transferir dinero',  href: '/mi-cuenta?tab=transferir' },
      { label: 'Pagar servicios',    href: '/mi-cuenta?tab=servicios' },
      { label: 'Cobrar con QR',      href: '/mi-cuenta?tab=qr' },
      { label: 'Extracto de cuenta', href: '/billetera/extracto' },
      { label: 'Acerca de Pago Simple', href: '/pago-simple' },
    ],
  },
  {
    title: 'Ayuda y legal',
    links: [
      { label: 'Centro de ayuda',        href: '/ayuda' },
      { label: 'Centro de seguridad',    href: '/proteccion-comprador' },
      { label: 'Términos y condiciones', href: '/terminos' },
      { label: 'Privacidad',             href: '/privacidad' },
      { label: 'Defensa del consumidor', href: '/defensa-consumidor' },
      { label: 'Contáctanos',            href: '/contacto' },
    ],
  },
  {
    title: 'Mercado Simple',
    links: [
      { label: 'Quiénes somos',        href: '/quienes-somos' },
      { label: 'Blog',                 href: '/blog' },
      { label: 'Trabaja con nosotros', href: '/trabaja-con-nosotros' },
      { label: 'Inversores',           href: '/inversores' },
      { label: 'Prensa',               href: '/prensa' },
      { label: 'Sustentabilidad',      href: '/sustentabilidad' },
      { label: 'Developers',           href: '/contacto' },
    ],
  },
];

const POPULAR_SEARCHES = [
  'iPhone 16', 'Samsung Galaxy', 'Smart TV', 'Notebook', 'Heladera',
  'Lavarropas', 'Aire acondicionado', 'Zapatillas Nike', 'PlayStation 5',
  'Auriculares Bluetooth', 'Freidora sin aceite', 'Reloj inteligente',
  'Tablet', 'Cámara de seguridad', 'Bicicleta',
];

const PAYMENT_BADGES = [
  { short: 'VISA',       bg: '#1a1f71' },
  { short: 'MC',         bg: '#EB001B' },
  { short: 'AMEX',       bg: '#006FCF' },
  { short: 'NRJ',        bg: '#FF6600' },
  { short: 'CBL',        bg: '#009933' },
  { short: 'RAPIPAGO',   bg: '#002A5C' },
  { short: 'PAGO FÁCIL', bg: '#3AAA35' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Benefits bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck,       label: 'Envío gratis',     desc: 'En miles de productos',        color: 'text-green-400' },
              { icon: Shield,      label: 'Compra Protegida', desc: 'Garantía de devolución',       color: 'text-blue-400' },
              { icon: CreditCard,  label: 'Hasta 12 cuotas', desc: 'Sin interés seleccionados',     color: 'text-purple-400' },
              { icon: Headphones,  label: 'Soporte 24/7',     desc: 'Siempre disponibles',          color: 'text-orange-400' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                <div>
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main columns — una sola sección de enlaces */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <SolMayo size={30} />
              <div>
                <div className="font-black text-white text-base leading-tight tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  MERCADO <span className="text-[#F6B40E]">SIMPLE</span>
                </div>
                <div className="text-gray-600 text-[9px] uppercase tracking-widest">🇦🇷 Hecho en Argentina</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">
              La plataforma de e-commerce más confiable de Argentina. Comprá y vendé con total seguridad.
            </p>
            <p className="text-xs text-gray-500 mb-3">
              <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Ingresá</Link>
              <span className="text-gray-600 mx-2">·</span>
              <Link href="/vendedor/productos/nuevo" className="text-gray-400 hover:text-white transition-colors">Publicá</Link>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs">Seguinos:</span>
              {[
                { Icon: Facebook,  label: 'Facebook',  hover: 'hover:text-blue-400' },
                { Icon: Instagram, label: 'Instagram', hover: 'hover:text-pink-400' },
                { Icon: Twitter,   label: 'X',         hover: 'hover:text-sky-400' },
                { Icon: Youtube,   label: 'YouTube',   hover: 'hover:text-red-400' },
              ].map(({ Icon, label, hover }) => (
                <Link
                  key={label}
                  href="/contacto"
                  aria-label={`${label} - próximamente`}
                  title="Próximamente en redes"
                  className={`text-gray-500 ${hover} transition-colors`}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Productos más buscados */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Productos más buscados</h4>
          <div className="flex flex-wrap gap-x-1 gap-y-0.5">
            {POPULAR_SEARCHES.map((term, i) => (
              <span key={term} className="text-xs">
                <Link
                  href={`/buscar?q=${encodeURIComponent(term)}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {term}
                </Link>
                {i < POPULAR_SEARCHES.length - 1 && (
                  <span className="text-gray-700 mx-1">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-1">Medios de pago:</span>
            {PAYMENT_BADGES.map(pm => (
              <div key={pm.short} className="px-2 py-1 rounded text-[10px] font-bold text-white" style={{ background: pm.bg }}>
                {pm.short}
              </div>
            ))}
            <div className="px-2 py-1 rounded text-[10px] font-bold bg-blue-600 text-white">PAGO SIMPLE</div>
          </div>
        </div>
      </div>

      {/* Legal / compliance bottom bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link href="/devoluciones" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                Botón de arrepentimiento
              </Link>
              <Link href="/defensa-consumidor" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                <ShieldCheck className="w-3.5 h-3.5" />
                Defensa del consumidor
              </Link>
              <Link href="/terminos" className="text-gray-500 hover:text-gray-300 transition-colors">Términos y condiciones</Link>
              <Link href="/privacidad" className="text-gray-500 hover:text-gray-300 transition-colors">Políticas de privacidad</Link>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 leading-relaxed max-w-4xl">
            Para reclamos ingresá{' '}
            <Link href="/defensa-consumidor" className="underline hover:text-gray-400 transition-colors">acá</Link>.
            Ley 24.240 de Defensa del Consumidor. Dirección General de Defensa y Protección al Consumidor.
            Para consultas y/o denuncias ingrese{' '}
            <Link href="/defensa-consumidor" className="underline hover:text-gray-400 transition-colors">aquí</Link>.
          </p>
          <p className="text-[10px] text-gray-600 mt-2">© {new Date().getFullYear()} Mercado Simple S.R.L. — Hecho con dedicación en Argentina 🇦🇷</p>
        </div>
      </div>
    </footer>
  );
}
