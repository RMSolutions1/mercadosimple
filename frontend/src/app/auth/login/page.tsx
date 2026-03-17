'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Shield, Zap, CheckCircle, ShoppingBag, Store, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { SolMayo } from '@/components/ui/SolMayo';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      await fetchCart();
      toast.success('¡Bienvenido de nuevo!');
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) { router.push(decodeURIComponent(returnUrl)); return; }
      if (user?.role === 'admin') router.push('/admin');
      else if (user?.role === 'seller') router.push('/vendedor/dashboard');
      else router.push('/mi-cuenta');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Credenciales inválidas');
    }
  };

  const fillDemo = (email: string, password: string) => setForm({ email, password });

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)' }}>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-8  w-96 h-96 bg-yellow-400/5  rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <SolMayo size={36} />
          <div>
            <div className="font-black text-white text-xl tracking-tight leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>
              MERCADO <span className="text-[#F6B40E]">SIMPLE</span>
            </div>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">🇦🇷 Hecho en Argentina</p>
          </div>
        </Link>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Todo lo que<br />
              <span className="text-[#F6B40E]">necesitás,</span><br />
              en un lugar
            </h1>
            <p className="text-white/50 text-base mt-4 leading-relaxed max-w-xs">
              Comprá, vendé y pagá con total seguridad. Millones de productos te esperan.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Shield,      text: 'Compra Protegida en cada transacción' },
              { icon: Zap,         text: 'Acreditación instantánea en tu billetera' },
              { icon: CheckCircle, text: 'Soporte 24/7 para compradores y vendedores' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#F6B40E]" />
                </div>
                <p className="text-white/70 text-sm">{text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-8">
            {[
              { value: '+2M',   label: 'Usuarios' },
              { value: '+500K', label: 'Productos' },
              { value: '99.8%', label: 'Satisfacción' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl font-black text-[#F6B40E]" style={{ fontFamily: 'Raleway, sans-serif' }}>{stat.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">© 2026 Mercado Simple · Todos los derechos reservados</p>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <SolMayo size={30} />
            <span className="font-black text-white text-lg tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
              MERCADO <span className="text-[#F6B40E]">SIMPLE</span>
            </span>
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-5">
              <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Ingresar</h2>
              <p className="text-gray-500 text-sm mt-1">Bienvenido de nuevo a Mercado Simple</p>
            </div>

            {/* Form */}
            <div className="px-8 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                    <Link href="/auth/recuperar" className="text-xs text-blue-600 hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><LogIn className="w-4 h-4" /> Ingresar</>
                  )}
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">Cuentas de demo</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '👑 Admin',    email: 'admin@mercadosimple.com',    password: 'Admin123*',     color: 'bg-red-50    text-red-700   border-red-200'   },
                    { label: '🏪 Vendedor', email: 'vendedor@mercadosimple.com', password: 'Vendedor123*', color: 'bg-green-50  text-green-700 border-green-200' },
                    { label: '👤 Comprador',email: 'comprador@mercadosimple.com',password: 'Comprador123*',color: 'bg-blue-50   text-blue-700  border-blue-200'  },
                  ].map(acc => (
                    <button key={acc.label} type="button" onClick={() => fillDemo(acc.email, acc.password)}
                      className={`text-xs py-2 px-2 rounded-xl border font-semibold transition-all hover:opacity-80 ${acc.color}`}>
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-5">
                ¿No tenés cuenta?{' '}
                <Link href="/auth/registro" className="text-blue-600 font-semibold hover:underline">Registrate gratis</Link>
              </p>
            </div>

            {/* Trust bar */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-6">
              {[
                { icon: Shield,      text: 'Datos cifrados' },
                { icon: CheckCircle, text: '100% seguro' },
                { icon: Zap,         text: 'Acceso inmediato' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon className="w-3.5 h-3.5 text-green-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Register CTA */}
          <div className="mt-4 flex gap-3">
            <Link href="/auth/registro?role=buyer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white/80 hover:text-white transition-colors border border-white/10 hover:border-white/20 hover:bg-white/5">
              <ShoppingBag className="w-4 h-4" />
              Quiero comprar
            </Link>
            <Link href="/auth/registro?role=seller"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white/80 hover:text-white transition-colors border border-white/10 hover:border-white/20 hover:bg-white/5">
              <Store className="w-4 h-4" />
              Quiero vender
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)' }}>
        <div className="w-10 h-10 border-4 border-[#F6B40E] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
