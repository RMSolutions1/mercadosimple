'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Download, Printer, ArrowUpRight, ArrowDownLeft,
  Building2, Filter, Calendar, TrendingUp, TrendingDown,
  FileText, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

const TX_TYPE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  deposit:      { label: 'Acreditación', color: '#10B981', bg: '#ECFDF5' },
  withdrawal:   { label: 'Extracción',   color: '#EF4444', bg: '#FEF2F2' },
  transfer_in:  { label: 'Transferencia recibida', color: '#10B981', bg: '#ECFDF5' },
  transfer_out: { label: 'Transferencia enviada',  color: '#EF4444', bg: '#FEF2F2' },
  payment:      { label: 'Pago de compra', color: '#EF4444', bg: '#FEF2F2' },
  refund:       { label: 'Reembolso',  color: '#10B981', bg: '#ECFDF5' },
  cashback:     { label: 'Cashback',   color: '#10B981', bg: '#ECFDF5' },
  qr_payment:   { label: 'Pago QR',    color: '#EF4444', bg: '#FEF2F2' },
};

export default function ExtractoPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) fetchStatement();
  }, [isAuthenticated]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/wallet/statement?from=${from}&to=${to}`);
      setStatement(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!statement) return;
    const rows = statement.transactions.map((tx: any) =>
      `${new Date(tx.date).toLocaleDateString('es-AR')}\t${tx.type}\t${tx.description || ''}\t${tx.isCredit ? '+' : '-'}$${Number(tx.amount).toFixed(2)}\t$${Number(tx.balanceAfter).toFixed(2)}`
    ).join('\n');

    const content = [
      `EXTRACTO DE CUENTA - MERCADO SIMPLE`,
      `Titular: ${statement.account.holder}`,
      `CVU: ${statement.account.cvu}`,
      `Alias: ${statement.account.alias}`,
      `N° Cuenta: ${statement.account.accountNumber}`,
      `Período: ${new Date(statement.period.from).toLocaleDateString('es-AR')} al ${new Date(statement.period.to).toLocaleDateString('es-AR')}`,
      ``,
      `Saldo inicial: $${Number(statement.summary.openingBalance).toFixed(2)} ARS`,
      `Total acreditado: $${Number(statement.summary.totalIn).toFixed(2)} ARS`,
      `Total debitado: $${Number(statement.summary.totalOut).toFixed(2)} ARS`,
      `Saldo final: $${Number(statement.summary.closingBalance).toFixed(2)} ARS`,
      ``,
      `FECHA\tTIPO\tDESCRIPCIÓN\tMOVIMIENTO\tSALDO`,
      rows,
      ``,
      `Documento generado el ${new Date().toLocaleString('es-AR')} - Pago Simple · Mercado Simple S.A.`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracto-${statement.account.accountNumber}-${from}-${to}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#F8FAFC' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/mi-cuenta?tab=billetera" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mi billetera
          </Link>
          <div className="flex gap-2">
            {statement && (
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" /> Descargar .txt
              </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, #1E3A5F, #37996B)' }}>
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>
        </div>

        {/* Account header */}
        {statement && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm" style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-white font-black text-xl mb-1">Extracto de Cuenta</div>
                <div className="text-gray-400 text-sm">Mercado Simple S.A. · Pago Simple PSP</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-blue-300 text-sm">{statement.account.accountNumber}</div>
                <div className="text-gray-500 text-xs mt-1">Buenos Aires, Argentina</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-400 text-xs mb-1">Titular</div>
                <div className="text-white font-semibold text-sm">{statement.account.holder}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">CVU</div>
                <div className="text-blue-300 font-mono text-xs break-all">{statement.account.cvu}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Alias</div>
                <div className="text-white font-semibold text-sm">{statement.account.alias}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Moneda</div>
                <div className="text-white font-semibold text-sm">ARS (Peso Argentino)</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-end print:hidden">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Desde</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hasta</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" />
          </div>
          <button onClick={fetchStatement} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Aplicar
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-500">Cargando extracto...</p>
          </div>
        )}

        {!loading && statement && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Saldo inicial', value: statement.summary.openingBalance, color: '#64748B' },
                { label: 'Total acreditado', value: statement.summary.totalIn, color: '#10B981', icon: TrendingUp },
                { label: 'Total debitado', value: statement.summary.totalOut, color: '#EF4444', icon: TrendingDown },
                { label: 'Saldo final', value: statement.summary.closingBalance, color: '#3B82F6' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className="text-xl font-black" style={{ color: s.color }}>
                    ${Number(s.value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">ARS</div>
                </div>
              ))}
            </div>

            {/* Period info */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Período: <span className="font-semibold text-gray-700">{new Date(statement.period.from).toLocaleDateString('es-AR')} al {new Date(statement.period.to).toLocaleDateString('es-AR')}</span>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{statement.summary.transactionCount}</span> movimientos
              </div>
            </div>

            {/* Transaction table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {statement.transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No hay movimientos en el período seleccionado</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Movimiento</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Saldo</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider print:hidden">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {statement.transactions.map((tx: any, i: number) => {
                      const meta = TX_TYPE_LABEL[tx.type] || { label: tx.type, color: '#64748B', bg: '#F1F5F9' };
                      return (
                        <tr key={tx.id || i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{new Date(tx.date).toLocaleDateString('es-AR')}</div>
                            <div className="text-xs text-gray-400">{new Date(tx.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-700 max-w-[200px] truncate">{tx.description || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className={`text-sm font-bold flex items-center justify-end gap-1 ${tx.isCredit ? 'text-green-600' : 'text-red-500'}`}>
                              {tx.isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                              {tx.isCredit ? '+' : '-'}${Number(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            <div className="text-sm font-semibold text-gray-900">${Number(tx.balanceAfter).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                          </td>
                          <td className="px-4 py-3 text-center print:hidden">
                            <Link href={`/billetera/comprobante/${tx.id}`} className="text-xs text-blue-600 hover:underline font-medium">
                              Ver
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                      <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900">Saldo al cierre del período</td>
                      <td colSpan={3} className="px-4 py-3 text-right text-lg font-black text-blue-600">
                        ${Number(statement.summary.closingBalance).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Legal */}
            <div className="mt-6 p-4 rounded-2xl text-center" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <p className="text-xs text-gray-400">Mercado Simple S.A. · Pago Simple PSP · CUIT 30-00000000-0 · Buenos Aires, Argentina</p>
              <p className="text-xs text-gray-400 mt-1">Extracto generado el {new Date().toLocaleString('es-AR')} · Para consultas: soporte@mercadosimple.com.ar</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
