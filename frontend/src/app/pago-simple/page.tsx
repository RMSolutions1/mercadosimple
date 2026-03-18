'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap, QrCode, Link2, DollarSign, Shield, ChevronRight, ArrowRight, CheckCircle,
  TrendingUp, CreditCard, Wallet, Copy, Plus, ExternalLink, BarChart3, X,
  Menu, ChevronDown, HelpCircle, Facebook, Instagram, Twitter, Youtube,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { SolMayo } from '@/components/ui/SolMayo';
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
  createdAt: string;
  payUrl: string;
}

const FEATURES = [
  { icon: Link2, title: 'Links de Cobro', desc: 'Generá links únicos para compartir por WhatsApp, redes o email. Cobrá desde cualquier lugar.', color: '#3B82F6' },
  { icon: QrCode, title: 'Cobro con QR', desc: 'Mostrá tu QR y que te paguen al instante. Sin contacto, 100% digital.', color: '#10B981' },
  { icon: CreditCard, title: 'Cuotas sin tarjeta', desc: 'Hasta 12 cuotas con fondos de billetera. Sin banco, sin fricción.', color: '#8B5CF6' },
  { icon: TrendingUp, title: 'Liquidaciones T+2', desc: 'Recibí tu dinero en 2 días hábiles en tu cuenta Pago Simple.', color: '#F59E0B' },
  { icon: Shield, title: 'Compra Protegida', desc: 'Garantizamos cada transacción. Si hay un problema, lo resolvemos.', color: '#EF4444' },
  { icon: BarChart3, title: 'Estadísticas en tiempo real', desc: 'Seguí cobros, links activos y liquidaciones en un panel claro.', color: '#06B6D4' },
];

const FOOTER_COLS = [
  {
    title: 'Cobrar',
    links: [
      { label: 'Links de cobro', href: '/mi-cuenta?tab=billetera' },
      { label: 'Cobro con QR', href: '/mi-cuenta?tab=qr' },
      { label: 'Cuotas', href: '/pago-simple#calculadora' },
      { label: 'Liquidaciones', href: '/mi-cuenta?tab=billetera' },
    ],
  },
  {
    title: 'Pagar',
    links: [
      { label: 'Mi billetera', href: '/mi-cuenta?tab=billetera' },
      { label: 'Cargar saldo', href: '/mi-cuenta?tab=depositar' },
      { label: 'Transferir', href: '/mi-cuenta?tab=transferir' },
      { label: 'Pagar servicios', href: '/mi-cuenta?tab=servicios' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Acerca de Pago Simple', href: '/pago-simple' },
      { label: 'Mercado Simple', href: '/' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Prensa', href: '/prensa' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y condiciones', href: '/terminos' },
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Defensa del consumidor', href: '/defensa-consumidor' },
    ],
  },
];

const SOCIAL = [
  { Icon: Facebook, href: '/contacto', label: 'Facebook' },
  { Icon: Instagram, href: '/contacto', label: 'Instagram' },
  { Icon: Twitter, href: '/contacto', label: 'X' },
  { Icon: Youtube, href: '/contacto', label: 'YouTube' },
];

const PAYMENT_LOGOS = [
  { name: 'Visa', bg: '#1a1f71' },
  { name: 'Mastercard', bg: '#EB001B' },
  { name: 'Pago Simple', bg: '#2563EB' },
];

export default function PagoSimplePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    if (isAuthenticated) {
      api.get('/pago-simple/links?limit=5').then(({ data }) => setMyLinks(data.links || [])).catch(() => {});
    }
  }, [isAuthenticated]);

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
      setMyLinks((prev) => [{ ...data, code: data?.code || data?.id }, ...prev].slice(0, 5));
      if (typeof window !== 'undefined') alert(`✅ Link creado: ${window.location.origin}${data.payUrl || '/pago-simple/pagar/' + data?.code}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al crear link');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (code: string) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/pago-simple/pagar/${code}` : '';
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <SolMayo size={32} />
              <div>
                <span className="font-black text-gray-900 text-lg tracking-tight block leading-tight">Pago Simple</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">por Mercado Simple</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/pago-simple" className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                Inicio
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                  Cobrar <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px]">
                    <Link href="/mi-cuenta?tab=billetera" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-blue-500" /> Links de cobro
                    </Link>
                    <Link href="/mi-cuenta?tab=qr" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-green-500" /> Cobro con QR
                    </Link>
                    <Link href="/pago-simple#calculadora" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-500" /> Cuotas
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                  Pagar <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px]">
                    <Link href="/mi-cuenta?tab=billetera" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Mi billetera
                    </Link>
                    <Link href="/mi-cuenta?tab=depositar" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Cargar saldo
                    </Link>
                    <Link href="/mi-cuenta?tab=servicios" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Pagar servicios
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/pago-simple#calculadora" className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                Tarifas
              </Link>
              <Link href="/ayuda" className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" /> Ayuda
              </Link>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowCreateLink(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
                  >
                    <Plus className="w-4 h-4" /> Crear link
                  </button>
                  <Link href="/mi-cuenta?tab=billetera" className="px-4 py-2.5 rounded-xl font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">
                    Mi cuenta
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                    Ingresar
                  </Link>
                  <Link href="/auth/registro" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                    Registrarse gratis
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 space-y-2">
              <Link href="/pago-simple" className="block px-4 py-2 font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
              <Link href="/mi-cuenta?tab=billetera" className="block px-4 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Links de cobro</Link>
              <Link href="/mi-cuenta?tab=qr" className="block px-4 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Cobro con QR</Link>
              <Link href="/mi-cuenta?tab=billetera" className="block px-4 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Mi billetera</Link>
              <Link href="/pago-simple#calculadora" className="block px-4 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Tarifas / Cuotas</Link>
              <Link href="/ayuda" className="block px-4 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Ayuda</Link>
              <div className="pt-2 flex gap-2">
                {isAuthenticated ? (
                  <>
                    <button onClick={() => { setShowCreateLink(true); setMobileMenuOpen(false); }} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>Crear link</button>
                    <Link href="/mi-cuenta?tab=billetera" className="flex-1 py-2.5 rounded-xl border border-gray-200 text-center font-medium" onClick={() => setMobileMenuOpen(false)}>Mi cuenta</Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1 py-2.5 rounded-xl border text-center font-medium" onClick={() => setMobileMenuOpen(false)}>Ingresar</Link>
                    <Link href="/auth/registro" className="flex-1 py-2.5 rounded-xl font-bold text-white text-center text-sm" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }} onClick={() => setMobileMenuOpen(false)}>Registrarse</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* ========== HERO ========== */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1E293B 100%)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
            <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/30" style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}>
                  <Zap className="w-4 h-4" />
                  Procesamiento instantáneo · 3.5% comisión
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                  Pago Simple
                  <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #3B82F6, #10B981)' }}>
                    El PSP de Argentina
                  </span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                  Cobrá con links, QR y cuotas. Pagá con tu billetera, servicios y más. Sin hardware, sin banco, sin burocracia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {isAuthenticated ? (
                    <button onClick={() => setShowCreateLink(true)} className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                      <Plus className="w-5 h-5" /> Crear Link de Cobro
                    </button>
                  ) : (
                    <Link href="/auth/registro" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                      Empezar Gratis <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                  <Link href="#calculadora" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold border border-white/20 text-white text-lg hover:bg-white/10 transition-all">
                    Ver cuotas
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0 w-full max-w-md">
                <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600"
                    alt="Billetera digital y pagos móviles"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: '4.2M+', label: 'Transacciones' },
                { value: '180K+', label: 'Vendedores activos' },
                { value: '3.5%', label: 'Comisión' },
                { value: '99.9%', label: 'Uptime' },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-gray-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CÓMO FUNCIONA ========== */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-4">Cómo funciona</h2>
            <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">En tres pasos empezás a cobrar o a pagar con Pago Simple.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', icon: Wallet, title: 'Creá tu cuenta', desc: 'Registrate gratis en Mercado Simple y activá tu billetera Pago Simple en segundos.' },
                { step: '2', icon: Link2, title: 'Generá links o QR', desc: 'Creá un link de cobro o mostrá tu QR. Tu cliente paga con un clic o escaneando.' },
                { step: '3', icon: CheckCircle, title: 'Recibí el dinero', desc: 'El dinero cae en tu billetera. Podés transferir a tu banco o usarlo en la plataforma.' },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-blue-600">Paso {step}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== MIS LINKS (si está logueado) ========== */}
        {isAuthenticated && myLinks.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mis últimos links</h2>
              <Link href="/mi-cuenta?tab=billetera" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLinks.map((link) => (
                <div key={link.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900 truncate max-w-[180px]">{link.title}</div>
                      <div className="text-2xl font-black text-gray-900 mt-1">${Number(link.amount).toLocaleString('es-AR')}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${link.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {link.status === 'active' ? 'Activo' : link.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => copyLink(link.code)} className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50">
                      {copiedCode === link.code ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copiedCode === link.code ? 'Copiado' : 'Copiar'}
                    </button>
                    <Link href={`/pago-simple/pagar/${link.code}`} className="flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========== FUNCIONALIDADES ========== */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-4">Todo para cobrar y pagar</h2>
          <p className="text-gray-500 text-center mb-12">Sin hardware, sin contrato, sin mínimos</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
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

        {/* ========== PARA VENDEDORES + IMAGEN ========== */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Para vendedores</h2>
                <p className="text-gray-600 mb-6">Cobrá por link o QR, ofrecé cuotas y recibí las liquidaciones en tu billetera. Todo integrado con Mercado Simple.</p>
                <ul className="space-y-3">
                  {['Links de cobro ilimitados', 'QR estático para tu negocio', 'Hasta 12 cuotas sin interés', 'Liquidaciones T+2'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/registro?role=seller" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                  Empezar a vender <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                <Image src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800" alt="Vendedor cobrando con QR" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            </div>
          </div>
        </section>

        {/* ========== PARA COMPRADORES + IMAGEN ========== */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                <Image src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800" alt="Pagar con billetera en el celular" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-black text-gray-900 mb-4">Para compradores</h2>
                <p className="text-gray-600 mb-6">Cargá saldo, pagá con un clic, usá cuotas desde tu billetera. Rápido y seguro.</p>
                <ul className="space-y-3">
                  {['Billetera en pesos argentinos', 'Pagar con QR o link', 'Cuotas sin tarjeta de crédito', 'Transferencias instantáneas'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/registro" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                  Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========== CALCULADORA DE CUOTAS ========== */}
        <section id="calculadora" className="py-16" style={{ background: 'linear-gradient(135deg, #F0F7FF, #F0FFF4)' }}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-3">Calculadora de Cuotas</h2>
            <p className="text-gray-500 text-center mb-10">Calculá cuánto paga tu cliente en cada plan</p>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto de venta</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => handleCalculatorChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 text-2xl font-bold outline-none transition-colors"
                    placeholder="5000"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {installmentPlans.map((plan) => (
                  <div key={plan.qty} className={`p-4 rounded-2xl border-2 transition-all ${plan.surcharge === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{plan.qty}x</span>
                      {plan.surcharge === 0 && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Sin interés</span>}
                      {plan.surcharge > 0 && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">+{(plan.surcharge * 100).toFixed(0)}%</span>}
                    </div>
                    <div className="text-xl font-black text-gray-900">${plan.installmentAmount?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>
                    <div className="text-xs text-gray-500 mt-1">por cuota</div>
                    <div className="text-xs text-gray-400 mt-1">Total: ${plan.totalAmount?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>
                  </div>
                ))}
                {installmentPlans.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-400">Ingresá un monto para ver los planes</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========== CTA FINAL ========== */}
        <section className="py-20 text-center" style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)' }}>
          <div className="max-w-2xl mx-auto px-4">
            <Zap className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">Empezá a cobrar hoy mismo</h2>
            <p className="text-gray-400 mb-8">Sin contrato. Sin costos de activación. Solo 3.5% por transacción exitosa.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <button onClick={() => setShowCreateLink(true)} className="px-8 py-4 rounded-2xl font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>Crear Link de Cobro</button>
                  <Link href="/mi-cuenta?tab=billetera" className="px-8 py-4 rounded-2xl font-bold border border-white/20 text-white text-lg hover:bg-white/10 transition-all">Ver mi Billetera</Link>
                </>
              ) : (
                <Link href="/auth/registro?role=seller" className="px-10 py-4 rounded-2xl font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>Registrarme gratis</Link>
              )}
            </div>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <SolMayo size={36} />
                  <div>
                    <div className="font-black text-white text-lg">Pago Simple</div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider">🇦🇷 Mercado Simple</div>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4">El sistema de pagos de Mercado Simple. Cobrá y pagá con un clic.</p>
                <div className="flex gap-3">
                  {SOCIAL.map(({ Icon, href, label }) => (
                    <Link key={label} href={href} aria-label={label} className="text-gray-500 hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </Link>
                  ))}
                </div>
              </div>
              {FOOTER_COLS.map((col) => (
                <div key={col.title}>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-gray-500 hover:text-white text-sm transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {PAYMENT_LOGOS.map((pm) => (
                  <div key={pm.name} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: pm.bg }}>
                    {pm.name}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-6 text-xs text-gray-500">
                <Link href="/terminos" className="hover:text-gray-300">Términos</Link>
                <Link href="/privacidad" className="hover:text-gray-300">Privacidad</Link>
                <Link href="/defensa-consumidor" className="hover:text-gray-300">Defensa del consumidor</Link>
              </div>
            </div>
            <p className="text-center text-gray-600 text-xs mt-6">© {new Date().getFullYear()} Mercado Simple S.R.L. — Pago Simple es un producto de Mercado Simple.</p>
          </div>
        </footer>
      </main>

      {/* ========== MODAL CREAR LINK ========== */}
      {showCreateLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Crear Link de Cobro</h3>
              <button onClick={() => setShowCreateLink(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del pago *</label>
                <input value={newLink.title} onChange={(e) => setNewLink((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none" placeholder="Ej: Consultoría web" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (ARS) *</label>
                <input type="number" value={newLink.amount} onChange={(e) => setNewLink((p) => ({ ...p, amount: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none" placeholder="5000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea value={newLink.description} onChange={(e) => setNewLink((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none" rows={2} placeholder="Detalle del producto/servicio..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={newLink.type} onChange={(e) => setNewLink((p) => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none">
                  <option value="single">Pago único</option>
                  <option value="reusable">Reutilizable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuotas máximas</label>
                <select value={newLink.maxInstallments} onChange={(e) => setNewLink((p) => ({ ...p, maxInstallments: parseInt(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none">
                  <option value={1}>1 cuota</option>
                  <option value={3}>3 cuotas</option>
                  <option value={6}>6 cuotas</option>
                  <option value={12}>12 cuotas</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowCreateLink(false)} className="flex-1 py-3 rounded-2xl font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleCreateLink} disabled={creating || !newLink.title || !newLink.amount} className="flex-1 py-3 rounded-2xl font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                {creating ? 'Creando...' : 'Crear Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
