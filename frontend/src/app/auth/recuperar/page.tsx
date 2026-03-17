'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-ms-blue">
            Mercado<span style={{ color: '#ff6900' }}>Simple</span>
          </Link>
          <p className="text-gray-600 mt-2">Recuperar contraseña</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-ms-blue" />
                </div>
                <p className="text-gray-600 text-sm">
                  Ingresá tu email y te enviaremos las instrucciones para restablecer tu contraseña.
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
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-ms-blue text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50"
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

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-ms-blue hover:underline">
              <ArrowLeft className="w-4 h-4" /> Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
