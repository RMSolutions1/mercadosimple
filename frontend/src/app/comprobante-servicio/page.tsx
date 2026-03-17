'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, ArrowLeft, Shield, Building2 } from 'lucide-react';
import { SolMayo } from '@/components/ui/SolMayo';

function ComprobanteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const raw = searchParams.get('data');
    if (raw) {
      try { setData(JSON.parse(decodeURIComponent(raw))); }
      catch { router.replace('/mi-cuenta?tab=servicios'); }
    } else {
      router.replace('/mi-cuenta?tab=servicios');
    }
  }, []);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" id="comprobante-root">
      {/* Toolbar — se oculta al imprimir */}
      <div className="max-w-lg mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link href="/mi-cuenta?tab=servicios" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a servicios
        </Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors">
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>

      {/* ── Boleta de pago ── */}
      <div className="max-w-lg mx-auto bg-white rounded-3xl overflow-hidden shadow-lg" id="boleta" style={{ border: '1px solid #E2E8F0' }}>

        {/* Header verde */}
        <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #065F46, #059669)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">Pago exitoso</p>
          <p className="text-white font-black text-4xl" style={{ fontFamily: 'Raleway, sans-serif' }}>
            ${Number(data.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-green-200 text-sm mt-1">ARS · Pesos argentinos</p>
        </div>

        {/* Logo + info empresa */}
        <div className="px-8 py-5 flex items-center gap-4" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl flex-shrink-0" style={{ border: '1px solid #E2E8F0' }}>
            {data.companyLogo || '🏢'}
          </div>
          <div>
            <p className="font-black text-gray-900 text-lg">{data.company}</p>
            <p className="text-gray-500 text-sm">{data.category || 'Pago de servicio'}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">Acreditado</span>
          </div>
        </div>

        {/* Detalle de la operación */}
        <div className="px-8 py-6 space-y-3">
          {[
            { label: 'N° de operación', val: data.operationId, mono: true, highlight: true },
            { label: 'Código de autorización', val: data.authCode, mono: true, highlight: true },
            { label: 'N° de factura', val: data.invoiceId || '—', mono: true },
            { label: 'Cuenta / Número', val: data.account, mono: true },
            { label: 'Período', val: data.period || '—', mono: false },
            { label: 'Método de pago', val: 'Pago Simple · Billetera digital', mono: false },
            { label: 'Fecha y hora', val: data.date, mono: false },
            { label: 'Tipo', val: data.type || 'Pago de servicio', mono: false },
          ].map(({ label, val, mono, highlight }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-gray-400 text-sm flex-shrink-0">{label}</span>
              <span className={`text-sm text-right ${mono ? 'font-mono' : 'font-medium'} ${highlight ? 'text-blue-700 font-bold' : 'text-gray-900'}`}>
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* Línea punteada tipo talonario */}
        <div className="px-8">
          <div className="border-t-2 border-dashed border-gray-200" />
        </div>

        {/* Total destacado */}
        <div className="px-8 py-5 flex justify-between items-center">
          <span className="font-bold text-gray-700 text-lg">Total pagado</span>
          <span className="font-black text-3xl text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
            ${Number(data.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex items-center justify-between" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-2">
            <SolMayo size={20} />
            <div>
              <p className="text-xs font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                MERCADO <span style={{ color: '#F6B40E' }}>SIMPLE</span>
              </p>
              <p className="text-[10px] text-gray-400">Pago Simple — Sistema de pagos de Mercado Simple</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">Transacción verificada</span>
          </div>
        </div>

        {/* Código QR visual (representación del N° operación) */}
        <div className="px-8 py-4 text-center" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p className="text-[10px] text-gray-300 font-mono break-all">{data.operationId} · {data.authCode} · {data.date}</p>
          <p className="text-[10px] text-gray-300 mt-1">Comprobante oficial de pago · Conservar como respaldo</p>
        </div>
      </div>

      {/* Botones finales */}
      <div className="max-w-lg mx-auto mt-5 grid grid-cols-2 gap-3 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Descargar PDF
        </button>
        <Link href="/mi-cuenta?tab=servicios"
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
          Nuevo pago
        </Link>
      </div>
    </div>
  );
}

export default function ComprobanteServicioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ComprobanteContent />
    </Suspense>
  );
}
