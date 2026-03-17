'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Lock, CheckCircle, AlertCircle, Zap,
  User, Clock, CreditCard, Wallet, ArrowLeft, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useWalletStore } from '@/store/wallet.store';
import api from '@/lib/axios';

interface LinkInfo {
  id: string;
  code: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  creator: { name: string; id: string };
  expiresAt: string;
  installmentPlans: Array<{
    qty: number;
    surcharge: number;
    label: string;
    totalAmount: number;
    installmentAmount: number;
  }>;
}

export default function PayLinkPage() {
  const { code } = useParams() as { code: string };
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { wallet, fetchWallet } = useWalletStore();
  const balance = Number(wallet?.balance || 0);

  const [mounted, setMounted] = useState(false);
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  const [selectedInstallments, setSelectedInstallments] = useState(1);

  useEffect(() => {
    setMounted(true);
    fetchLinkInfo();
  }, [code]);

  useEffect(() => {
    if (isAuthenticated) fetchWallet();
  }, [isAuthenticated]);

  const fetchLinkInfo = async () => {
    try {
      const { data } = await api.get(`/pago-simple/links/pay/${code}`);
      setLinkInfo(data);
      setSelectedInstallments(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Link no encontrado o expirado');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = linkInfo?.installmentPlans.find(p => p.qty === selectedInstallments);
  const totalToPay = selectedPlan?.totalAmount || linkInfo?.amount || 0;

  const handlePay = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=/pago-simple/pagar/${code}`);
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const { data } = await api.post(`/pago-simple/links/${code}/pay`, {
        installments: selectedInstallments,
      });
      setSuccess(data);
      fetchWallet();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F0FFF4 100%)' }}>
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link href="/pago-simple" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a Pago Simple
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg">Pago Simple</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <Lock className="w-3 h-3" /> Pago seguro · SSL · Compra Protegida
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {loading && (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500">Cargando...</p>
            </div>
          )}

          {!loading && error && !linkInfo && (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="font-bold text-gray-900 text-lg mb-2">Link no disponible</h2>
              <p className="text-gray-500 text-sm">{error}</p>
              <Link href="/pago-simple" className="mt-6 inline-block px-6 py-3 rounded-2xl font-medium text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                Ir a Pago Simple
              </Link>
            </div>
          )}

          {!loading && success && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-black text-2xl text-gray-900 mb-2">¡Pago exitoso!</h2>
              <p className="text-gray-500 mb-6">Tu pago fue procesado correctamente</p>
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Concepto</span>
                  <span className="font-medium text-gray-900">{linkInfo?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monto pagado</span>
                  <span className="font-bold text-gray-900">${Number(success.amount).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
                {selectedInstallments > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cuotas</span>
                    <span className="font-medium text-gray-900">{selectedInstallments}x</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Saldo actual</span>
                  <span className="font-bold text-blue-600">${Number(success.newBalance).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/mi-cuenta?tab=billetera" className="flex-1 py-3 rounded-2xl font-medium border border-gray-200 text-gray-700 text-center hover:bg-gray-50 transition-colors">
                  Ver billetera
                </Link>
                <Link href="/" className="flex-1 py-3 rounded-2xl font-bold text-white text-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                  Inicio
                </Link>
              </div>
            </div>
          )}

          {!loading && linkInfo && !success && (
            <>
              {/* Link info header */}
              <div className="p-6 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #F8FAFF, #F0FFF4)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">{linkInfo.creator.name} solicita un pago</div>
                    <div className="font-bold text-gray-900 text-lg">{linkInfo.title}</div>
                    {linkInfo.description && <div className="text-sm text-gray-500 mt-1">{linkInfo.description}</div>}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-4xl font-black text-gray-900">
                    ${Number(totalToPay).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{linkInfo.currency}</div>
                </div>
                {linkInfo.status !== 'active' && (
                  <div className="mt-3 flex items-center gap-2 justify-center text-amber-600 bg-amber-50 py-2 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Este link {linkInfo.status === 'paid' ? 'ya fue pagado' : 'no está disponible'}
                  </div>
                )}
              </div>

              {linkInfo.status === 'active' && (
                <div className="p-6 space-y-4">
                  {/* Installment selector */}
                  {linkInfo.installmentPlans.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Elegí tu plan de pago</label>
                      <div className="space-y-2">
                        {linkInfo.installmentPlans.map(plan => (
                          <label key={plan.qty} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedInstallments === plan.qty ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input
                              type="radio"
                              name="installments"
                              value={plan.qty}
                              checked={selectedInstallments === plan.qty}
                              onChange={() => setSelectedInstallments(plan.qty)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedInstallments === plan.qty ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">{plan.label}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 text-sm">${plan.installmentAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}/mes</div>
                              {plan.surcharge > 0 && <div className="text-xs text-gray-400">Total: ${plan.totalAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wallet balance info */}
                  {isAuthenticated && (
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Saldo disponible</div>
                        <div className="font-bold text-gray-900">${Number(balance).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>
                      </div>
                      {Number(balance) < totalToPay && (
                        <Link href="/mi-cuenta?tab=billetera" className="text-xs text-blue-600 hover:underline">
                          Cargar saldo
                        </Link>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {isAuthenticated ? (
                    <button
                      onClick={handlePay}
                      disabled={processing || Number(balance) < totalToPay}
                      className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
                    >
                      {processing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                      ) : (
                        <><CreditCard className="w-5 h-5" /> Pagar ${Number(totalToPay).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-center text-sm text-gray-500">Para pagar, ingresá a tu cuenta</p>
                      <Link href={`/auth/login?returnUrl=/pago-simple/pagar/${code}`} className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                        Ingresar para pagar
                      </Link>
                      <Link href={`/auth/registro?returnUrl=/pago-simple/pagar/${code}`} className="w-full py-3 rounded-2xl font-medium border-2 border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        Crear cuenta gratis
                      </Link>
                    </div>
                  )}

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Shield className="w-3.5 h-3.5 text-green-500" /> Compra Protegida
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="w-3.5 h-3.5 text-blue-500" /> SSL 256-bit
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-purple-500" /> Instantáneo
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
