'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  LogIn,
  Shield,
  Zap,
  CreditCard,
  Smartphone,
  Truck,
  Package,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { safeReturnUrl } from '@/lib/utils';
import { authPath, type AuthBrand } from '@/lib/auth-routes';
import { SolMayo } from '@/components/ui/SolMayo';
import toast from 'react-hot-toast';

type Props = { brand: AuthBrand };

export function LoginPageContent({ brand }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnRaw = searchParams.get('returnUrl');
  const registroQuery = new URLSearchParams();
  if (safeReturnUrl(returnRaw)) registroQuery.set('returnUrl', returnRaw!);
  const roleParam = searchParams.get('role');
  if (roleParam === 'seller' || roleParam === 'buyer') registroQuery.set('role', roleParam);

  const registroHref = registroQuery.toString()
    ? `${authPath(brand, 'registro')}?${registroQuery.toString()}`
    : authPath(brand, 'registro');
  const recuperarHref = authPath(brand, 'recuperar');
  const otherBrandLoginHref =
    brand === 'marketplace'
      ? (returnRaw && safeReturnUrl(returnRaw)
          ? `${authPath('psp', 'login')}?returnUrl=${encodeURIComponent(returnRaw)}`
          : authPath('psp', 'login'))
      : (returnRaw && safeReturnUrl(returnRaw)
          ? `${authPath('marketplace', 'login')}?returnUrl=${encodeURIComponent(returnRaw)}`
          : authPath('marketplace', 'login'));

  const { login, isLoading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      await fetchCart();
      toast.success('¡Bienvenido!');
      const next = safeReturnUrl(searchParams.get('returnUrl'));
      if (next) {
        router.push(next);
        return;
      }
      router.push('/mi-cuenta');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Credenciales inválidas');
    }
  };

  const isPsp = brand === 'psp';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Panel izquierdo: marca */}
      <div
        className="lg:w-[48%] min-h-[40vh] lg:min-h-screen relative overflow-hidden flex flex-col justify-between p-8 lg:p-12 z-0"
        style={
          isPsp
            ? { background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 40%, #1E40AF 70%, #2563EB 100%)' }
            : { background: 'linear-gradient(160deg, #1E3A5F 0%, #2E6DA8 40%, #4A8AC4 70%, #74ACDF 100%)' }
        }
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <div className="relative z-10">
          {isPsp ? (
            <Link href="/pago-simple" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Zap className="w-7 h-7 text-[#93C5FD]" />
              </div>
              <div>
                <span className="font-black text-white text-xl tracking-tight block">Pago Simple</span>
                <span className="text-blue-200/80 text-xs">por Mercado Simple</span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 group">
              <SolMayo size={40} />
              <div>
                <span className="font-black text-white text-xl leading-none tracking-tight block" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  MERCADO <span className="text-arg-sol">SIMPLE</span>
                </span>
                <span className="text-white/50 text-[10px] uppercase tracking-widest">Marketplace · Argentina</span>
              </div>
            </Link>
          )}
        </div>

        <div className="relative z-10">
          {isPsp ? (
            <>
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
            </>
          ) : (
            <>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight max-w-md" style={{ fontFamily: 'Raleway, sans-serif' }}>
                El marketplace de los argentinos
              </h1>
              <p className="text-white/90 mt-4 text-lg max-w-md">
                Comprá con Compra Protegida, vendé con cobro seguro y usá Pago Simple cuando quieras pagar con saldo.
              </p>
              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { Icon: Package, label: 'Millones de publicaciones' },
                  { Icon: Truck, label: 'Envíos a todo el país' },
                  { Icon: Shield, label: 'Compra Protegida' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-white/85">
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative z-10 hidden lg:block pointer-events-none">
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-white/5 backdrop-blur">
            <Image
              src={
                isPsp
                  ? 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600'
                  : 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'
              }
              alt=""
              fill
              className="object-cover opacity-90 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="lg:w-[52%] min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 bg-white relative z-30">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">
              {isPsp ? 'Ingresar a Pago Simple' : 'Ingresar a Mercado Simple'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Misma cuenta y contraseña que en {isPsp ? 'el marketplace' : 'Pago Simple'}.
            </p>
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
                <Link href={recuperarHref} className="text-xs font-medium text-blue-600 hover:underline">
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
              style={{
                background: isPsp
                  ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                  : 'linear-gradient(135deg, #4A8AC4 0%, #2E6DA8 100%)',
              }}
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
            <Link href={registroHref} className="font-semibold text-blue-600 hover:underline">
              Crear cuenta gratis
            </Link>
          </p>

          <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed px-2">
            {isPsp ? (
              <>
                ¿Querés comprar o vender productos?{' '}
                <Link href={otherBrandLoginHref} className="font-semibold text-blue-600 hover:underline">
                  Ingresá al marketplace
                </Link>
              </>
            ) : (
              <>
                ¿Solo vas a usar la billetera y servicios?{' '}
                <Link href={otherBrandLoginHref} className="font-semibold text-blue-600 hover:underline">
                  Ingresá a Pago Simple
                </Link>
              </>
            )}
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              Cifrado
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              Una sola cuenta
            </span>
          </div>

          <Link
            href={isPsp ? '/pago-simple' : '/'}
            className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-6"
          >
            ← Volver a {isPsp ? 'Pago Simple' : 'Mercado Simple'}
          </Link>
        </div>
      </div>
    </div>
  );
}
