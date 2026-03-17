'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart, Search, Menu, X, User, ChevronDown, Heart, Package,
  LogOut, Settings, BarChart2, Wallet, MessageCircle, Bell, Tag,
  ChevronRight, Shield, Zap, Star, MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useWalletStore } from '@/store/wallet.store';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
const ThemeToggle = dynamic(() => import('@/components/ui/ThemeToggle').then(m => m.ThemeToggle), { ssr: false });

const MEGA_MENU_CATEGORIES = [
  { name: 'Tecnología', emoji: '💻', slug: 'tecnologia', subs: ['Laptops', 'Monitores', 'Tablets', 'Impresoras', 'Accesorios'] },
  { name: 'Smartphones', emoji: '📱', slug: 'smartphones', subs: ['iPhone', 'Samsung', 'Motorola', 'Xiaomi', 'Accesorios'] },
  { name: 'Electrodomésticos', emoji: '🏠', slug: 'electrodomesticos', subs: ['Lavarropas', 'Heladeras', 'Aire acond.', 'Microondas'] },
  { name: 'Televisores', emoji: '📺', slug: 'televisores', subs: ['Smart TV', '4K', 'OLED', 'QLED', 'Proyectores'] },
  { name: 'Gaming', emoji: '🎮', slug: 'gaming', subs: ['PlayStation', 'Xbox', 'Nintendo', 'PC Gaming'] },
  { name: 'Moda', emoji: '👗', slug: 'moda', subs: ['Ropa Mujer', 'Ropa Hombre', 'Calzado', 'Accesorios'] },
  { name: 'Hogar y Deco', emoji: '🛋️', slug: 'hogar', subs: ['Muebles', 'Decoración', 'Iluminación', 'Jardín'] },
  { name: 'Deportes', emoji: '⚽', slug: 'deportes', subs: ['Fitness', 'Fútbol', 'Running', 'Ciclismo'] },
  { name: 'Campo y Agro', emoji: '🌾', slug: 'agro', subs: ['Herramientas', 'Semillas', 'Riego', 'Tractores'] },
  { name: 'Industria', emoji: '⚙️', slug: 'industria', subs: ['Maquinaria', 'Herramientas', 'Seguridad', 'Minería'] },
];

// Sol de Mayo SVG compacto
const SolMayo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="animate-spin-slow flex-shrink-0">
    {[0,30,60,90,120,150,180,210,240,270,300,330,15,45,75,105,135,165,195,225,255,285,315,345].map((angle, i) => {
      const r = angle * Math.PI / 180;
      const isMain = i < 12;
      const len = isMain ? 28 : 20;
      const start = isMain ? 22 : 23;
      return (
        <line key={i} x1={50 + Math.cos(r)*start} y1={50 + Math.sin(r)*start}
              x2={50 + Math.cos(r)*(start+len)} y2={50 + Math.sin(r)*(start+len)}
              stroke="#F6B40E" strokeWidth={isMain ? 3.5 : 2} strokeLinecap="round" />
      );
    })}
    <circle cx="50" cy="50" r="18" fill="#F6B40E" stroke="#D4960A" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="10" fill="#D4960A" />
    {/* Cara del sol */}
    <circle cx="45" cy="47" r="2" fill="#8B5E3C" />
    <circle cx="55" cy="47" r="2" fill="#8B5E3C" />
    <path d="M 44 54 Q 50 59 56 54" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, openCart } = useCartStore();
  const { wallet } = useWalletStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) setMegaMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications/unread-count').then((r) => setUnreadNotifs(r.data.count)).catch(() => {});
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const r = await api.get('/notifications?limit=5');
      setNotifications(r.data.notifications || []);
      setUnreadNotifs(0);
      await api.patch('/notifications/read-all').catch(() => {});
    } catch {}
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  const cartCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const walletBalance = wallet ? Number(wallet.balance) : 0;

  return (
    <header className="sticky top-0 z-50">
      {/* FRANJA SUPERIOR — bandera arg */}
      <div className="flag-stripe" />

      {/* NAVBAR PRINCIPAL */}
      <div className="bg-arg-hero text-white shadow-arg-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 py-2.5">

            {/* ===== LOGO CON SOL DE MAYO ===== */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <SolMayo size={32} />
              <div className="hidden sm:block">
                <span className="font-black text-white text-xl leading-none tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  MERCADO
                </span>
                <span className="font-black text-arg-sol text-xl leading-none tracking-tight ml-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  SIMPLE
                </span>
                <div className="text-white/40 text-[8px] uppercase tracking-widest leading-none" style={{ fontFamily: 'Lato, sans-serif' }}>
                  🇦🇷 Hecho en Argentina
                </div>
              </div>
            </Link>

            {/* ===== MEGA MENÚ CATEGORÍAS ===== */}
            <div className="relative hidden lg:block" ref={megaMenuRef}>
              <button
                onMouseEnter={() => setMegaMenuOpen(true)}
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-white/10 transition-all whitespace-nowrap border border-white/20"
              >
                <Menu className="w-4 h-4" />
                Categorías
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {megaMenuOpen && (
                <div
                  onMouseLeave={() => setMegaMenuOpen(false)}
                  className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 grid grid-cols-2 gap-0.5 min-w-[480px]"
                >
                  <div className="col-span-2 px-2 py-1 mb-1 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explorá categorías</p>
                  </div>
                  {MEGA_MENU_CATEGORIES.map((cat) => (
                    <div key={cat.slug} className="group">
                      <Link
                        href={`/categorias/${cat.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-arg-celeste-light transition-colors"
                      >
                        <span className="text-xl w-7 flex-shrink-0">{cat.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                          <p className="text-gray-400 text-xs truncate">{cat.subs.slice(0, 2).join(', ')}...</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-200 group-hover:text-arg-celeste transition-colors flex-shrink-0" />
                      </Link>
                    </div>
                  ))}
                  <div className="col-span-2 border-t border-gray-100 pt-2 mt-1">
                    <Link
                      href="/productos"
                      onClick={() => setMegaMenuOpen(false)}
                      className="flex items-center justify-center gap-2 text-arg-celeste-dark text-sm font-bold hover:underline py-1"
                    >
                      Ver todos los productos <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ===== BÚSQUEDA ===== */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscá productos, marcas, vendedores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-3 focus:ring-arg-sol/50 bg-white placeholder:text-gray-400 shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-arg-sol hover:bg-arg-sol-dark text-white p-2 rounded-lg transition-colors shadow-sol"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* ===== ACCIONES DERECHA ===== */}
            <div className="flex items-center gap-0.5">

{/* Wallet icon removed — accessible via Mi cuenta / Pago Simple */}

              {/* NOTIFICACIONES */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications(); }}
                    className="relative flex flex-col items-center p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="text-[9px] text-white/70 hidden md:block mt-0.5">Alertas</span>
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {unreadNotifs > 9 ? '9+' : unreadNotifs}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                      <div className="flag-stripe" />
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Notificaciones</span>
                        <Link href="/perfil/notificaciones" className="text-arg-celeste-dark text-xs font-semibold hover:underline">Ver todas</Link>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                          No tenés notificaciones nuevas
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((n, i) => (
                            <div key={i} className={`px-4 py-3 border-b border-gray-50 hover:bg-arg-celeste-light transition ${!n.isRead ? 'bg-blue-50/60' : ''}`}>
                              <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{n.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* FAVORITOS */}
              {isAuthenticated && (
                <Link href="/perfil/favoritos" className="flex flex-col items-center p-2 rounded-xl hover:bg-white/10 transition-colors hidden md:flex">
                  <Heart className="w-5 h-5" />
                  <span className="text-[9px] text-white/70 mt-0.5">Favoritos</span>
                </Link>
              )}

              {/* TEMA TOGGLE */}
              <ThemeToggle size="sm" className="hidden md:flex opacity-80 hover:opacity-100" />

              {/* CARRITO */}
              <button onClick={openCart} className="relative flex flex-col items-center p-2 rounded-xl hover:bg-white/10 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-[9px] text-white/70 hidden md:block mt-0.5">Carrito</span>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-arg-sol text-white text-[9px] rounded-full flex items-center justify-center font-black">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* USUARIO */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-white/10 transition-all border border-white/20 ml-1"
                  >
                    <div className="w-7 h-7 rounded-full bg-arg-sol text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sol">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-bold hidden md:block max-w-[90px] truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3 h-3 hidden md:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col"
                      style={{ maxHeight: 'min(88vh, 600px)' }}>
                      {/* Cabecera fija */}
                      <div className="flex-shrink-0">
                        <div className="flag-stripe" />
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-arg-celeste-light to-white">
                          <p className="font-black text-gray-900 text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>{user.name}</p>
                          <p className="text-gray-500 text-xs truncate">{user.email}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'seller' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role === 'admin' ? '👑 Admin' : user.role === 'seller' ? '🏪 Vendedor' : '🛒 Comprador'}
                          </span>
                        </div>
                        {/* Acceso rápido admin */}
                        {user.role === 'admin' && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-white font-bold transition-all"
                            style={{ background: 'linear-gradient(135deg,#7C3AED,#9333EA)' }}>
                            <Shield className="w-4 h-4" />
                            <span className="flex-1">Panel de Administración</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {/* Cuerpo con scroll */}
                      <div className="overflow-y-auto flex-1 py-1">
                        {/* ── Mercado Simple ── */}
                        <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mercado Simple</p>
                        {[
                          { href: '/mi-cuenta', Icon: User, label: 'Mi cuenta' },
                          { href: '/mi-cuenta?tab=pedidos', Icon: Package, label: 'Mis pedidos' },
                          { href: '/mi-cuenta?tab=favoritos', Icon: Heart, label: 'Favoritos' },
                          { href: '/chat', Icon: MessageCircle, label: 'Mensajes' },
                          { href: '/mi-cuenta?tab=notificaciones', Icon: Bell, label: 'Notificaciones',
                            extra: unreadNotifs > 0 ? String(unreadNotifs) : null, extraClass: 'bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full' },
                        ].map(({ href, Icon, label, extra, extraClass }) => (
                          <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-arg-celeste-light transition-colors group"
                          >
                            <Icon className="w-4 h-4 text-gray-400 group-hover:text-arg-celeste-dark transition-colors" />
                            <span className="flex-1 group-hover:text-arg-celeste-dark transition-colors">{label}</span>
                            {extra && <span className={`font-bold ${extraClass}`}>{extra}</span>}
                          </Link>
                        ))}

                        {/* ── Pago Simple ── */}
                        <div className="mx-4 my-1 h-px bg-gray-100" />
                        <p className="px-4 pt-1 pb-1 text-[10px] font-bold text-blue-500 uppercase tracking-wider">⚡ Pago Simple</p>
                        {[
                          { href: '/mi-cuenta?tab=billetera', Icon: Wallet, label: 'Mi billetera' },
                          { href: '/mi-cuenta?tab=depositar', Icon: Wallet, label: 'Cargar saldo' },
                          { href: '/mi-cuenta?tab=transferir', Icon: Wallet, label: 'Transferir dinero' },
                          { href: '/mi-cuenta?tab=servicios', Icon: Wallet, label: 'Pagar servicios' },
                          { href: '/mi-cuenta?tab=qr', Icon: Wallet, label: 'Cobrar con QR' },
                          { href: '/billetera/extracto', Icon: Wallet, label: 'Extracto de cuenta' },
                        ].map(({ href, Icon, label }) => (
                          <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
                          >
                            <Icon className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                            <span className="flex-1 group-hover:text-blue-600 transition-colors">{label}</span>
                          </Link>
                        ))}

                        {(user.role === 'seller' || user.role === 'admin') && (
                          <>
                            <div className="mx-4 my-1 h-px bg-gray-100" />
                            <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vendedor</p>
                            {[
                              { href: '/vendedor/dashboard', icon: BarChart2, label: 'Panel de ventas' },
                              { href: '/vendedor/dashboard?tab=estadisticas', icon: Zap, label: 'Estadísticas' },
                              { href: '/vendedor/dashboard?tab=preguntas', icon: MessageCircle, label: 'Preguntas' },
                              { href: '/vendedor/productos/nuevo', icon: Tag, label: 'Publicar producto' },
                            ].map(({ href, icon: Icon, label }) => (
                              <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors group"
                              >
                                <Icon className="w-4 h-4 text-gray-400 group-hover:text-arg-verde transition-colors" />
                                <span className="group-hover:text-arg-verde transition-colors">{label}</span>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Pie fijo */}
                      <div className="flex-shrink-0 border-t border-gray-100">
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-gray-500">Tema</span>
                          <ThemeToggle size="sm" />
                        </div>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/auth/login"
                    className="text-white text-sm font-bold hover:text-arg-sol transition-colors hidden sm:block px-3 py-1.5"
                    style={{ fontFamily: 'Raleway, sans-serif' }}
                  >
                    Ingresar
                  </Link>
                  <Link href="/auth/registro"
                    className="bg-arg-sol hover:bg-arg-sol-dark text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-sol hover:scale-105"
                    style={{ fontFamily: 'Raleway, sans-serif' }}
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* MOBILE MENU TOGGLE */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl hover:bg-white/10 transition lg:hidden ml-1">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ===== BARRA SECUNDARIA ===== */}
          <div className="hidden lg:flex items-center gap-0.5 pb-2 text-sm overflow-x-auto scrollbar-hide">
            {[
              { href: '/ofertas', label: '⚡ Ofertas', hot: true },
              { href: '/como-comprar', label: 'Cómo comprar' },
              { href: '/como-pagar', label: 'Cómo pagar' },
              { href: '/como-vender', label: 'Cómo vender' },
              { href: '/empezar-a-vender', label: 'Empezar a vender' },
              { href: '/proteccion-comprador', label: '🛡️ Compra Protegida' },
              { href: '/seguimiento', label: '📦 Rastrear envío' },
              { href: '/devoluciones', label: 'Devoluciones' },
              { href: '/blog', label: '📰 Blog' },
              { href: '/ayuda', label: '❓ Ayuda' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-pill ${item.hot
                  ? 'text-arg-sol font-bold hover:bg-white/10'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
                } ${pathname === item.href ? 'bg-white/15 text-white' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FRANJA INFERIOR — bandera arg */}
      <div className="flag-stripe" />

      {/* ===== MENÚ MÓVIL ===== */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white text-gray-900 border-t border-gray-100 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1.5">
            {isAuthenticated && user ? (
              <>
                {/* Perfil usuario */}
                <div className="flex items-center gap-3 p-3 bg-arg-celeste-light rounded-2xl mb-3">
                  <div className="w-10 h-10 rounded-full bg-arg-sol flex items-center justify-center text-white font-black text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                  {wallet && (
                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-400">Saldo</p>
                      <p className="font-black text-arg-celeste-dark text-sm">{formatPrice(walletBalance)}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 pt-1">Mi cuenta — Mercado Simple</p>
                {[
                  { href: '/mi-cuenta', icon: '👤', label: 'Mi cuenta' },
                  { href: '/mi-cuenta?tab=pedidos', icon: '📦', label: 'Mis pedidos' },
                  { href: '/chat', icon: '💬', label: 'Mensajes' },
                  { href: '/mi-cuenta?tab=favoritos', icon: '❤️', label: 'Favoritos' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-arg-celeste-light transition-colors font-medium text-gray-700"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 pt-2">Pago Simple</p>
                {[
                  { href: '/mi-cuenta?tab=billetera', icon: '⚡', label: 'Mi billetera Pago Simple' },
                  { href: '/mi-cuenta?tab=depositar', icon: '➕', label: 'Cargar saldo' },
                  { href: '/mi-cuenta?tab=transferir', icon: '↗️', label: 'Transferir' },
                  { href: '/mi-cuenta?tab=servicios', icon: '🧾', label: 'Pagar servicios' },
                  { href: '/mi-cuenta?tab=qr', icon: '📱', label: 'Cobrar por QR' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-gray-600 text-sm"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 pt-2">Navegar</p>
                {[
                  { href: '/ofertas', icon: '⚡', label: 'Ofertas del día' },
                  { href: '/como-comprar', icon: '🛒', label: 'Cómo comprar' },
                  { href: '/como-pagar', icon: '💳', label: 'Cómo pagar' },
                  { href: '/empezar-a-vender', icon: '🏪', label: 'Empezar a vender' },
                  { href: '/seguimiento', icon: '📦', label: 'Rastrear envío' },
                  { href: '/devoluciones', icon: '↩️', label: 'Devoluciones' },
                  { href: '/blog', icon: '📰', label: 'Blog' },
                  { href: '/ayuda', icon: '❓', label: 'Ayuda' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 text-sm"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="h-px bg-gray-100 my-1" />
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}
                  className="block p-3.5 text-center bg-arg-celeste-dark text-white rounded-2xl font-black text-base"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                >
                  Ingresar
                </Link>
                <Link href="/auth/registro" onClick={() => setIsMenuOpen(false)}
                  className="block p-3.5 text-center bg-arg-sol text-white rounded-2xl font-black text-base shadow-sol"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                >
                  Crear cuenta gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
