'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Shield, Zap } from 'lucide-react';
import api from '@/lib/axios';
import { authPath, type AuthBrand } from '@/lib/auth-routes';
import { SolMayo } from '@/components/ui/SolMayo';
import toast from 'react-hot-toast';

type Props = { brand: AuthBrand };

export function ForgotPasswordContent({ brand }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const isPsp = brand === 'psp';
  const loginHref = authPath(brand, 'login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Error al enviar email');
    } finally {
      setIsLoading(false);
    }
  };

  const headerBg = isPsp
    ? 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)'
    : 'linear-gradient(160deg, #1E3A5F 0%, #2E6DA8 50%, #4A8AC4 100%)';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div
        className="lg:w-[42%] min-h-[32vh] lg:min-h-screen p-8 lg:p-12 flex flex-col justify-between text-white"
        style={{ background: headerBg }}
      >
        <div>
          {isPsp ? (
            <Link href="/pago-simple" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <span className="font-black text-lg block">Pago Simple</span>
                <span className="text-blue-200/80 text-xs">Recuperación de acceso</span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <SolMayo size={36} />
              <span className="font-black text-lg" style={{ fontFamily: 'Raleway, sans-serif' }}>
                MERCADO <span className="text-arg-sol">SIMPLE</span>
              </span>
            </Link>
          )}
        </div>
        <div className="max-w-sm">
          <h1 className="text-2xl lg:text-3xl font-black leading-tight">
            {isPsp ? 'Recuperá el acceso a tu billetera' : 'Recuperá el acceso a tu cuenta'}
          </h1>
          <p className="text-white/85 mt-3 text-sm lg:text-base">
            Te enviamos un enlace para crear una nueva contraseña. La misma clave sirve para Mercado Simple y Pago Simple.
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/70 text-xs">
            <Shield className="w-4 h-4" />
            Proceso seguro y cifrado
          </div>
        </div>
        <p className="text-white/30 text-xs hidden lg:block">
          {isPsp ? 'Pago Simple · Mercado Simple' : 'Mercado Simple'}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {!sent ? (
              <>
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isPsp ? 'bg-blue-100' : 'bg-arg-celeste-light'
                    }`}
                  >
                    <Mail className={`w-8 h-8 ${isPsp ? 'text-blue-600' : 'text-ms-blue'}`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Recuperar contraseña</h2>
                  <p className="text-gray-600 text-sm mt-2">
                    Ingresá el email de tu cuenta. Si existe, recibirás instrucciones (revisá también spam).
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-50 transition-colors"
                    style={{
                      background: isPsp ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'linear-gradient(135deg, #4A8AC4, #2E6DA8)',
                    }}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">¡Listo!</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Si el email existe en nuestro sistema, recibirás las instrucciones de recuperación.
                </p>
                {resetToken && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
                    <p className="text-xs text-yellow-800 font-medium">Token de demo (solo en desarrollo):</p>
                    <p className="text-xs text-yellow-700 break-all mt-1 font-mono">{resetToken}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center space-y-2">
              <Link href={loginHref} className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:underline font-medium">
                <ArrowLeft className="w-4 h-4" /> Volver al login {isPsp ? 'de Pago Simple' : 'de Mercado Simple'}
              </Link>
              <p className="text-xs text-gray-400">
                ¿Entraste desde el otro producto?{' '}
                <Link href={authPath(isPsp ? 'marketplace' : 'psp', 'recuperar')} className="text-blue-600 hover:underline">
                  Versión {isPsp ? 'marketplace' : 'Pago Simple'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
