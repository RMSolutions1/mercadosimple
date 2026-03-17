'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, ArrowLeft, Download, Printer, Share2,
  ArrowUpRight, ArrowDownLeft, Building2, CreditCard,
  Shield, Zap, AlertCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

const TYPE_LABELS: Record<string, string> = {
  transfer: 'Transferencia',
  deposit: 'Acreditación de saldo',
  withdrawal: 'Extracción',
  payment: 'Pago de compra',
  refund: 'Reembolso',
  qr_payment: 'Pago con QR',
  link_payment: 'Pago por link',
};

const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  transfer: ArrowUpRight,
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  payment: ArrowUpRight,
  refund: ArrowDownLeft,
  qr_payment: ArrowUpRight,
  link_payment: ArrowUpRight,
};

export default function ComprobantePage() {
  const { id } = useParams() as { id: string };
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) fetchReceipt();
  }, [id, isAuthenticated]);

  const fetchReceipt = async () => {
    try {
      const { data } = await api.get(`/wallet/receipts/${id}`);
      setReceipt(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Comprobante no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!receipt || !printRef.current) return;
    const html = `<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>Comprobante ${receipt.receiptNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #fff; color: #1E293B; padding: 40px; }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #E2E8F0; }
        .logo { width: 56px; height: 56px; background: linear-gradient(135deg, #1E3A5F, #37996B); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 900; }
        .logo-text h1 { font-size: 20px; font-weight: 900; color: #1E3A5F; }
        .logo-text p { font-size: 12px; color: #64748B; }
        .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #DCFCE7; border-radius: 24px; color: #166534; font-weight: 700; font-size: 14px; margin-bottom: 24px; }
        .receipt-number { font-size: 13px; color: #64748B; margin-bottom: 32px; }
        .amount-section { text-align: center; margin: 32px 0; padding: 32px; background: #F8FAFC; border-radius: 16px; border: 1px solid #E2E8F0; }
        .amount-label { font-size: 14px; color: #64748B; margin-bottom: 8px; }
        .amount { font-size: 48px; font-weight: 900; color: #1E293B; }
        .amount .currency { font-size: 24px; color: #64748B; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
        .party-box { padding: 20px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; }
        .party-title { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .party-name { font-size: 18px; font-weight: 700; color: #1E293B; margin-bottom: 8px; }
        .party-detail { font-size: 12px; color: #64748B; margin-bottom: 4px; }
        .party-cvu { font-family: monospace; font-size: 13px; color: #3B82F6; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748B; }
        .detail-value { font-weight: 600; color: #1E293B; }
        .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center; }
        .footer p { font-size: 11px; color: #94A3B8; line-height: 1.6; }
        .verify { display: inline-block; margin-top: 8px; padding: 6px 16px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 11px; color: #64748B; }
      </style>
    </head><body>
      <div class="header">
        <div class="logo">MS</div>
        <div class="logo-text">
          <h1>Mercado Simple</h1>
          <p>Pago Simple PSP · Buenos Aires, Argentina</p>
        </div>
      </div>
      <div class="status-badge">✓ Operación exitosa</div>
      <p class="receipt-number">N° Comprobante: <strong>${receipt.receiptNumber}</strong> · ${new Date(receipt.date).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })}</p>
      <div class="amount-section">
        <p class="amount-label">${TYPE_LABELS[receipt.type] || receipt.type}</p>
        <div class="amount"><span class="currency">$ </span>${Number(receipt.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span class="currency">ARS</span></div>
      </div>
      <div class="grid">
        <div class="party-box">
          <p class="party-title">Origen / Remitente</p>
          <p class="party-name">${receipt.sender?.name || '—'}</p>
          <p class="party-detail">${receipt.sender?.email || ''}</p>
          <p class="party-cvu">CVU: ${receipt.sender?.cvu || '—'}</p>
          <p class="party-detail">Alias: ${receipt.sender?.alias || '—'}</p>
          <p class="party-detail">Cuenta: ${receipt.sender?.accountNumber || '—'}</p>
        </div>
        ${receipt.recipient ? `
        <div class="party-box">
          <p class="party-title">Destino / Receptor</p>
          <p class="party-name">${receipt.recipient?.name || '—'}</p>
          <p class="party-detail">${receipt.recipient?.email || ''}</p>
          <p class="party-cvu">CVU: ${receipt.recipient?.cvu || '—'}</p>
          <p class="party-detail">Alias: ${receipt.recipient?.alias || '—'}</p>
          <p class="party-detail">Cuenta: ${receipt.recipient?.accountNumber || '—'}</p>
        </div>` : ''}
      </div>
      <div>
        <div class="detail-row"><span class="detail-label">Saldo antes</span><span class="detail-value">$${Number(receipt.sender?.balanceBefore || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS</span></div>
        <div class="detail-row"><span class="detail-label">Saldo después</span><span class="detail-value">$${Number(receipt.sender?.balanceAfter || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS</span></div>
        ${receipt.description ? `<div class="detail-row"><span class="detail-label">Concepto</span><span class="detail-value">${receipt.description}</span></div>` : ''}
      </div>
      <div class="footer">
        <p>${receipt.legalText}</p>
        <p>Este comprobante es válido como respaldo de la operación.</p>
        <span class="verify">Verificar en mercadosimple.com.ar/billetera/comprobante/${id}</span>
      </div>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante-${receipt.receiptNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#F8FAFC' }}>
      <div className="max-w-2xl mx-auto">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/mi-cuenta?tab=billetera" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a mi billetera
          </Link>
          {receipt && (
            <div className="flex gap-2">
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-white transition-colors bg-white">
                <Download className="w-4 h-4" /> Descargar
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all" style={{ background: 'linear-gradient(135deg, #1E3A5F, #37996B)' }}>
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-500">Cargando comprobante...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="font-bold text-gray-900 text-lg mb-2">Comprobante no disponible</h2>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        )}

        {!loading && receipt && (
          <div ref={printRef} className="bg-white rounded-3xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
            {/* Header */}
            <div className="p-8 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #37996B)' }}>
                  MS
                </div>
                <div>
                  <div className="text-white font-black text-xl">Mercado Simple</div>
                  <div className="text-gray-400 text-sm">Pago Simple PSP · Buenos Aires, Argentina</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-green-300" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <CheckCircle className="w-4 h-4" /> Operación exitosa
                </div>
                <div className="text-gray-400 text-sm">
                  {new Date(receipt.date).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
              </div>
              <div className="font-mono text-sm text-blue-300">
                N° {receipt.receiptNumber}
              </div>
            </div>

            {/* Amount */}
            <div className="p-8 text-center border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #F8FAFF, #F0FFF4)' }}>
              <div className="text-gray-500 text-sm mb-2 uppercase tracking-wider font-medium">
                {TYPE_LABELS[receipt.type] || receipt.type}
              </div>
              <div className="text-5xl font-black text-gray-900 mb-2">
                <span className="text-2xl text-gray-500">$ </span>
                {Number(receipt.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xl text-gray-500"> ARS</span>
              </div>
              <div className="text-gray-400 text-sm">{receipt.description}</div>
            </div>

            {/* Parties */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100">
              <div className="p-4 rounded-2xl" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Origen / Remitente</div>
                <div className="font-bold text-gray-900 text-lg mb-1">{receipt.sender?.name}</div>
                <div className="text-sm text-gray-500 mb-2">{receipt.sender?.email}</div>
                <div className="space-y-1">
                  <div className="font-mono text-xs text-blue-600 break-all">CVU: {receipt.sender?.cvu}</div>
                  <div className="text-xs text-gray-500">Alias: <span className="font-semibold text-gray-700">{receipt.sender?.alias}</span></div>
                  <div className="text-xs text-gray-500">Cuenta: <span className="font-semibold text-gray-700">{receipt.sender?.accountNumber}</span></div>
                </div>
              </div>

              {receipt.recipient && (
                <div className="p-4 rounded-2xl" style={{ background: '#F0FFF4', border: '1px solid #BBF7D0' }}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Destino / Receptor</div>
                  <div className="font-bold text-gray-900 text-lg mb-1">{receipt.recipient?.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{receipt.recipient?.email}</div>
                  <div className="space-y-1">
                    <div className="font-mono text-xs text-green-600 break-all">CVU: {receipt.recipient?.cvu}</div>
                    <div className="text-xs text-gray-500">Alias: <span className="font-semibold text-gray-700">{receipt.recipient?.alias}</span></div>
                    <div className="text-xs text-gray-500">Cuenta: <span className="font-semibold text-gray-700">{receipt.recipient?.accountNumber}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 space-y-0 border-b border-gray-100">
              {[
                { label: 'Saldo previo del remitente', value: `$${Number(receipt.sender?.balanceBefore || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS` },
                { label: 'Saldo posterior del remitente', value: `$${Number(receipt.sender?.balanceAfter || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS`, highlight: true },
                { label: 'Tipo de operación', value: TYPE_LABELS[receipt.type] || receipt.type },
                { label: 'Estado', value: receipt.status === 'completed' ? '✓ Completada' : receipt.status },
                { label: 'N° de comprobante', value: receipt.receiptNumber, mono: true },
                { label: 'Fecha y hora', value: new Date(receipt.date).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'medium' }) },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-none">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className={`text-sm font-semibold ${row.highlight ? 'text-blue-600' : 'text-gray-900'} ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Legal footer */}
            <div className="p-6 bg-gray-50 rounded-b-3xl">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-xs text-gray-500">{receipt.legalText}</p>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                  Este comprobante puede ser verificado en <span className="font-semibold text-gray-600">mercadosimple.com.ar</span> con el número {receipt.receiptNumber}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
