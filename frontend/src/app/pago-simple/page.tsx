'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap, QrCode, Link2, DollarSign, Shield, Clock,
  ChevronRight, ArrowRight, CheckCircle, TrendingUp,
  Users, CreditCard, Smartphone, Globe, Star, Copy,
  Plus, ExternalLink, BarChart3, Wallet, X
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

interface InstallmentPlan {
  qty: number;
  surcharge: number;
  label: string;
  totalAmount: number;
  installmentAmount: number;
}

interface PaymentLink {
  id: string;
  code: string;
  title: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  payUrl: string;
  viewCount: number;
}

const FEATURES = [
  { icon: Link2, title: 'Links de Cobro', desc: 'Generá links únicos para compartir por WhatsApp, redes o email. Cobrá desde cualquier lugar.', color: '#3B82F6' },
  { icon: QrCode, title: 'Cobro con QR', desc: 'Mostrá tu QR y que te paguen al instante. Funciona sin contacto y es instantáneo.', color: '#10B981' },
  { icon: CreditCard, title: 'Cuotas sin tarjeta', desc: 'Ofrecé hasta 12 cuotas con fondos de billetera. Sin banco, sin fricción.', color: '#8B5CF6' },
  { icon: TrendingUp, title: 'Liquidaciones T+2', desc: 'Recibí tu dinero en 2 días hábiles directo en tu cuenta Pago Simple.', color: '#F59E0B' },
  { icon: Shield, title: 'Compra Protegida', desc: 'Garantizamos cada transacción. Si hay un problema, lo resolvemos nosotros.', color: '#EF4444' },
  { icon: BarChart3, title: 'Estadísticas en tiempo real', desc: 'Seguí tus cobros, links activos, cuotas y liquidaciones en un panel claro.', color: '#06B6D4' },
];

const STATS = [
  { label: 'Transacciones procesadas', value: '4.2M+' },
  { label: 'Vendedores activos', value: '180K+' },
  { label: 'Comisión plataforma', value: '3.5%' },
  { label: 'Disponibilidad del servicio', value: '99.9%' },
];

export default function PagoSimplePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [myLinks, setMyLinks] = useState<PaymentLink[]>([]);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [newLink, setNewLink] = useState({ title: '', amount: '', description: '', type: 'single', maxInstallments: 1 });
  const [calculatorAmount, setCalculatorAmount] = useState('5000');
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchInstallments(5000);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchMyLinks();
  }, [isAuthenticated]);

  const fetchMyLinks = async () => {
    try {
      const { data } = await api.get('/pago-simple/links?limit=5');
      setMyLinks(data.links || []);
    } catch { /* silent */ }
  };

  const fetchInstallments = async (amount: number) => {
    try {
      const { data } = await api.get(`/pago-simple/installments/${amount}`);
      setInstallmentPlans(data.plans || []);
    } catch { /* silent */ }
  };

  const handleCalculatorChange = (val: string) => {
    setCalculatorAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) fetchInstallments(num);
  };

  const handleCreateLink = async () => {
    if (!newLink.title || !newLink.amount) return;
    setCreating(true);
    try {
      const { data } = await api.post('/pago-simple/links', {
        title: newLink.title,
        amount: parseFloat(newLink.amount),
        description: newLink.description,
        type: newLink.type,
        maxInstallments: newLink.maxInstallments,
      });
      setShowCreateLink(false);
      setNewLink({ title: '', amount: '', description: '', type: 'single', maxInstallments: 1 });
      await fetchMyLinks();
      alert(`✅ Link creado: ${window.location.origin}${data.payUrl}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al crear link');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/pago-simple/pagar/${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      {/* ====== HERO ====== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1E293B 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/30" style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}>
                <Zap className="w-4 h-4" />
                Procesamiento instantáneo · 3.5% comisión
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
                Pago Simple
                <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #3B82F6, #10B981)' }}>
                  El PSP de Argentina
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Cobrá con links, QR y cuotas. Sin hardware, sin banco, sin burocracia.
                El sistema de pagos oficial de Mercado Simple — para compradores y vendedores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowCreateLink(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
                  >
                    <Plus className="w-5 h-5" /> Crear Link de Cobro
                  </button>
                ) : (
                  <Link href="/auth/registro" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                    Empezar Gratis <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                <Link href="#calculadora" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold border border-white/20 text-white text-lg hover:bg-white/10 transition-all">
                  Calcular cuotas
                </Link>
              </div>
            </div>
            {/* Hero visual */}
            <div className="flex-shrink-0">
              <div className="relative w-72 h-72">
                <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                  <Zap className="w-16 h-16 text-blue-400 mb-4" />
                  <div className="text-white font-black text-3xl">$24,150</div>
                  <div className="text-green-400 text-sm mt-1">+$1,200 hoy</div>
                  <div className="mt-4 flex gap-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-2 rounded-full transition-all`} style={{ height: `${20 + i * 10}px`, background: i === 3 ? '#3B82F6' : 'rgba(255,255,255,0.3)' }} />
                    ))}
                  </div>
                  <div className="text-gray-400 text-xs mt-2">Cobros esta semana</div>
                </div>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-gray-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== MIS LINKS (si está logueado) ====== */}
      {isAuthenticated && myLinks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mis últimos links</h2>
            <Link href="/mi-cuenta?tab=billetera" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myLinks.map(link => (
              <div key={link.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 truncate max-w-[180px]">{link.title}</div>
                    <div className="text-2xl font-black text-gray-900 mt-1">${Number(link.amount).toLocaleString('es-AR')}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${link.status === 'active' ? 'bg-green-100 text-green-700' : link.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {link.status === 'active' ? 'Activo' : link.status === 'paid' ? 'Pagado' : link.status}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => copyLink(link.code)} className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                    {copiedCode === link.code ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === link.code ? 'Copiado' : 'Copiar'}
                  </button>
                  <Link href={`/pago-simple/pagar/${link.code}`} className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====== FEATURES ====== */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Todo lo que necesitás para cobrar</h2>
          <p className="text-gray-500 text-lg">Sin hardware, sin contrato, sin mínimos</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${f.color}15` }}>
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====== CALCULADORA DE CUOTAS ====== */}
      <section id="calculadora" className="py-16" style={{ background: 'linear-gradient(135deg, #F0F7FF, #F0FFF4)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Calculadora de Cuotas</h2>
            <p className="text-gray-500">Calculá cuánto paga tu cliente en cada plan</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto de venta</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  value={calculatorAmount}
                  onChange={e => handleCalculatorChange(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 text-2xl font-bold outline-none transition-colors"
                  placeholder="5000"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {installmentPlans.map(plan => (
                <div key={plan.qty} className={`p-4 rounded-2xl border-2 transition-all ${plan.surcharge === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{plan.qty}x</span>
                    {plan.surcharge === 0 && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Sin interés</span>}
                    {plan.surcharge > 0 && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">+{(plan.surcharge * 100).toFixed(0)}%</span>}
                  </div>
                  <div className="text-xl font-black text-gray-900">${plan.installmentAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>
                  <div className="text-xs text-gray-500 mt-1">por cuota</div>
                  <div className="text-xs text-gray-400 mt-1">Total: ${plan.totalAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>
                </div>
              ))}
              {installmentPlans.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-400">
                  Ingresá un monto para ver los planes disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA FINAL ====== */}
      <section className="py-20 text-center" style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <Zap className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Empezá a cobrar hoy mismo</h2>
          <p className="text-gray-400 mb-8">Sin contrato de permanencia. Sin costos de activación. Solo 3.5% por transacción exitosa.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <button onClick={() => setShowCreateLink(true)} className="px-8 py-4 rounded-2xl font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                  Crear Link de Cobro
                </button>
                <Link href="/mi-cuenta?tab=billetera" className="px-8 py-4 rounded-2xl font-bold border border-white/20 text-white text-lg hover:bg-white/10 transition-all">
                  Ver mi Billetera
                </Link>
              </>
            ) : (
              <Link href="/auth/registro?role=seller" className="px-10 py-4 rounded-2xl font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                Registrarme gratis
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ====== MODAL: CREAR LINK ====== */}
      {showCreateLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Crear Link de Cobro</h3>
              <button onClick={() => setShowCreateLink(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del pago *</label>
                <input
                  value={newLink.title}
                  onChange={e => setNewLink(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Ej: Consultoría web"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (ARS) *</label>
                <input
                  type="number"
                  value={newLink.amount}
                  onChange={e => setNewLink(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea
                  value={newLink.description}
                  onChange={e => setNewLink(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none transition-colors"
                  rows={2}
                  placeholder="Detalle del producto/servicio..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de link</label>
                <select
                  value={newLink.type}
                  onChange={e => setNewLink(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
                >
                  <option value="single">Pago único (1 uso)</option>
                  <option value="reusable">Reutilizable (múltiples pagos)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuotas máximas permitidas</label>
                <select
                  value={newLink.maxInstallments}
                  onChange={e => setNewLink(p => ({ ...p, maxInstallments: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
                >
                  <option value={1}>Solo 1 cuota</option>
                  <option value={3}>Hasta 3 cuotas</option>
                  <option value={6}>Hasta 6 cuotas</option>
                  <option value={12}>Hasta 12 cuotas</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateLink(false)}
                className="flex-1 py-3 rounded-2xl font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateLink}
                disabled={creating || !newLink.title || !newLink.amount}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
              >
                {creating ? 'Creando...' : 'Crear Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
