'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode, Shield, Lock, CheckCircle, AlertCircle,
  Zap, ArrowLeft, Loader2, Wallet, User
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useWalletStore } from '@/store/wallet.store';
import api from '@/lib/axios';

interface QRInfo {
  qrCode: string;
  qrImageBase64: string;
  amount: number | null;
  description: string;
  owner: { name: string; id: string };
  status: string;
  expiresAt: string;
}

export default function PayQRPage() {
  const { qrCode } = useParams() as { qrCode: string };
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { wallet, fetchWallet } = useWalletStore();
  const balance = Number(wallet?.balance || 0);

  const [mounted, setMounted] = useState(false);
  const [qrInfo, setQrInfo] = useState<QRInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchQRInfo();
  }, [qrCode]);

  useEffect(() => {
    if (isAuthenticated) fetchWallet();
  }, [isAuthenticated]);

  const fetchQRInfo = async () => {
    try {
      const { data } = await api.get(`/pago-simple/qr/${qrCode}`);
      setQrInfo(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'QR no encontrado o expirado');
    } finally {
      setLoading(false);
    }
  };

  const amountToPay = qrInfo?.amount || parseFloat(customAmount) || 0;

  const handlePay = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=/pago-simple/qr/${qrCode}`);
      return;
    }
    if (!amountToPay || amountToPay <= 0) {
      setError('Ingresá un monto válido');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const { data } = await api.post(`/pago-simple/qr/${qrCode}/pay`, { amount: amountToPay });
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
        <div className="text-center mb-6">
          <Link href="/pago-simple" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a Pago Simple
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg">Pago con QR</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {loading && (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500">Cargando QR...</p>
            </div>
          )}

          {!loading && error && !qrInfo && (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="font-bold text-gray-900 text-lg mb-2">QR no disponible</h2>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && success && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-black text-2xl text-gray-900 mb-2">¡Pago exitoso!</h2>
              <p className="text-gray-500 mb-4">Pago QR procesado correctamente</p>
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monto</span>
                  <span className="font-bold text-gray-900">${Number(success.amount).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Saldo nuevo</span>
                  <span className="font-bold text-blue-600">${Number(success.newBalance).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <Link href="/mi-cuenta?tab=billetera" className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                Ver billetera
              </Link>
            </div>
          )}

          {!loading && qrInfo && !success && (
            <>
              <div className="p-6 border-b border-gray-100 text-center" style={{ background: 'linear-gradient(135deg, #F8FAFF, #F0FFF4)' }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">{qrInfo.owner.name}</span>
                </div>
                {qrInfo.description && <p className="text-gray-500 text-sm mb-3">{qrInfo.description}</p>}
                {qrInfo.status !== 'active' && (
                  <div className="flex items-center gap-2 justify-center text-amber-600 bg-amber-50 py-2 px-4 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4" />
                    QR {qrInfo.status === 'paid' ? 'ya utilizado' : 'expirado'}
                  </div>
                )}
              </div>

              {qrInfo.status === 'active' && (
                <div className="p-6 space-y-4">
                  {qrInfo.amount ? (
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900">${Number(qrInfo.amount).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>
                      <div className="text-sm text-gray-500 mt-1">Monto fijo</div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ingresá el monto a pagar</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 text-2xl font-bold outline-none transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Saldo disponible</div>
                        <div className="font-bold text-gray-900">${Number(balance).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>
                      </div>
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
                      disabled={processing || !amountToPay}
                      className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
                    >
                      {processing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                      ) : (
                        <><QrCode className="w-5 h-5" /> Pagar{amountToPay > 0 ? ` $${amountToPay.toLocaleString('es-AR', { maximumFractionDigits: 2 })}` : ''}</>
                      )}
                    </button>
                  ) : (
                    <Link href={`/auth/login?returnUrl=/pago-simple/qr/${qrCode}`} className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                      Ingresar para pagar
                    </Link>
                  )}

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Shield className="w-3.5 h-3.5 text-green-500" /> Protegido
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="w-3.5 h-3.5 text-blue-500" /> Seguro
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
