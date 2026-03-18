'use client';
export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, LogIn, Shield, Zap, CreditCard, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
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
      toast.success('¡Bienvenido!');
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
        return;
      }
      router.push('/mi-cuenta');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left: branding Pago Simple — estilo Mercado Pago / Ualá */}
      <div className="lg:w-[48%] min-h-[40vh] lg:min-h-screen relative overflow-hidden flex flex-col justify-between p-8 lg:p-12"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 40%, #1E40AF 70%, #2563EB 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/5 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#93C5FD]" />
            </div>
            <div>
              <span className="font-black text-white text-xl tracking-tight block">Pago Simple</span>
              <span className="text-blue-200/80 text-xs">por Mercado Simple</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight max-w-md">
            Tu billetera digital en un solo lugar
          </h1>
          <p className="text-blue-100/90 mt-4 text-lg max-w-sm">
            Pagá servicios, recargá, transferí y cobrá con links o QR. Rápido y seguro.
          </p>
          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { Icon: CreditCard, label: 'Pago de servicios' },
              { Icon: Smartphone, label: 'Recargas' },
              { Icon: Zap, label: 'Transferencias al instante' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/80">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 hidden lg:block">
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur">
            <Image
              src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600"
              alt="Billetera"
              fill
              className="object-cover opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Right: formulario */}
      <div className="lg:w-[52%] min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Ingresar a Pago Simple</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresá tu email y contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                <Link href="/auth/recuperar" className="text-xs font-medium text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tenés cuenta?{' '}
            <Link href="/auth/registro" className="font-semibold text-blue-600 hover:underline">
              Crear cuenta gratis
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              Cifrado
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              Acceso inmediato
            </span>
          </div>

          <Link href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-6">
            ← Volver a Mercado Simple
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
