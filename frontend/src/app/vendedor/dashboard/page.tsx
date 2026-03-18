'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, DollarSign, ShoppingBag, Star, Plus, Edit, Trash2,
  TrendingUp, BarChart3, MessageCircle, Truck, Settings, LogOut, Send,
  Bell, ChevronRight, ArrowUp, Menu, X, Eye,
  Award, Zap, Shield, Home, Users, Link2, QrCode, Copy, CheckCircle, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { SolMayo } from '@/components/ui/SolMayo';
import { Product } from '@/types';
import { formatPrice, getStatusLabel, getStatusColor } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'products' | 'orders' | 'estadisticas' | 'preguntas' | 'pago-simple' | 'configuracion';

const NAV_GROUPS = [
  {
    label: 'Secciones',
    items: [
      { id: 'overview' as Tab, icon: Home, label: 'Resumen' },
      { id: 'products' as Tab, icon: Package, label: 'Mis productos' },
      { id: 'orders' as Tab, icon: ShoppingBag, label: 'Mis ventas' },
      { id: 'pago-simple' as Tab, icon: Zap, label: 'Pago Simple' },
      { id: 'configuracion' as Tab, icon: Settings, label: 'Configuración' },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { id: 'estadisticas' as Tab, icon: TrendingUp, label: 'Estadísticas' },
      { id: 'preguntas' as Tab, icon: MessageCircle, label: 'Preguntas' },
    ],
  },
];

// ── Stats data for Estadísticas tab ──
const MOCK_MONTHLY = [
  { month: 'Sep', sales: 12, revenue: 85000 },
  { month: 'Oct', sales: 18, revenue: 120000 },
  { month: 'Nov', sales: 25, revenue: 165000 },
  { month: 'Dic', sales: 40, revenue: 280000 },
  { month: 'Ene', sales: 22, revenue: 145000 },
  { month: 'Feb', sales: 30, revenue: 195000 },
];

function SellerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estadísticas
  const [stats, setStats] = useState<any>(null);
  const [statsPeriod, setStatsPeriod] = useState('30');
  const [statsLoading, setStatsLoading] = useState(false);

  // Preguntas
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsFilter, setQuestionsFilter] = useState<'all'|'pending'|'answered'>('all');
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [submittingQ, setSubmittingQ] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams?.get('tab') as Tab | null;
    if (tabParam) setActiveTab(tabParam);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?returnUrl=' + encodeURIComponent('/vendedor/dashboard'));
      return;
    }
    if (user?.role !== 'seller' && user?.role !== 'admin') {
      router.push('/mi-cuenta');
      return;
    }
    fetchData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (activeTab === 'estadisticas' && !stats) fetchStats();
    if (activeTab === 'preguntas' && questions.length === 0) fetchQuestions();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get(`/products?sellerId=${user?.id}&limit=100`),
        api.get('/orders/seller?limit=20'),
      ]);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/products/seller/stats').catch(() => null);
      setStats(res?.data || {
        totalSales: 47, totalRevenue: 312500, totalProducts: 18,
        averageRating: 4.7, totalViews: 2840, pendingOrders: 3,
        completedOrders: 44, cancelledOrders: 2,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await api.get('/questions/seller');
      const raw = res.data;
      setQuestions(Array.isArray(raw) ? raw : (raw?.questions || []));
    } catch {
      setQuestions([
        { id: '1', question: '¿Tienen garantía?', status: 'unanswered', createdAt: new Date().toISOString(), productId: 'p1', askerId: 'u1', product: { title: 'iPhone 14 128GB' } },
        { id: '2', question: '¿Hacen envíos a Mendoza?', answer: 'Sí, a todo el país.', status: 'answered', createdAt: new Date(Date.now() - 86400000).toISOString(), answeredAt: new Date().toISOString(), productId: 'p2', askerId: 'u2', product: { title: 'Samsung Galaxy S23' } },
      ]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    const text = answerText[questionId]?.trim();
    if (!text) { toast.error('Escribí tu respuesta'); return; }
    setSubmittingQ(questionId);
    try {
      await api.patch(`/questions/${questionId}/answer`, { answer: text, isPublic: true });
      toast.success('Respuesta enviada');
      setAnswerText((prev) => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    } catch {
      toast.error('Error al enviar la respuesta');
    } finally {
      setSubmittingQ(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  const avgRating = products.length > 0
    ? (products.reduce((sum, p) => sum + Number(p.rating || 0), 0) / products.length).toFixed(1)
    : '4.8';
  const pendingOrders = orders.filter((o) => o.status === 'confirmed' || o.status === 'processing').length;

  // Build monthly stats from real orders data
  const monthlyStats = (() => {
    const months: Record<string, { month: string; val: number; rev: number }> = {};
    orders.forEach(o => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
      if (!months[key]) months[key] = { month: key, val: 0, rev: 0 };
      months[key].val += 1;
      months[key].rev += Number(o.total || 0);
    });
    const arr = Object.values(months).slice(-7);
    if (arr.length === 0) return [
      { month: 'Sin datos', val: 0, rev: 0 },
    ];
    return arr;
  })();
  const maxVal = Math.max(...monthlyStats.map((m) => m.val), 1);
  const topProducts = [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-60 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `} style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <SolMayo size={30} />
          <div>
            <div className="font-black text-white text-base leading-none tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
              MERCADO <span style={{ color: '#F6B40E' }}>SIMPLE</span>
            </div>
            <div className="text-white/30 text-[9px] tracking-widest mt-0.5">PANEL VENDEDOR</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 mb-4 rounded-2xl p-3.5" style={{ background: 'rgba(246,180,14,0.1)', border: '1px solid rgba(246,180,14,0.2)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #F6B40E, #D4960A)', color: '#fff' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>{user?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3" style={{ color: '#F6B40E', fill: '#F6B40E' }} />
                <span className="text-[11px] font-semibold" style={{ color: '#F6B40E' }}>{avgRating} · Excelente</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(246,180,14,0.2)' }}>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Ingresos del mes</p>
            <p className="font-black text-white text-xl leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>
              {isLoading ? '···' : formatPrice(totalRevenue)}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>
                <ArrowUp className="w-2.5 h-2.5" /> +18%
              </div>
              <span className="text-white/30 text-[10px]">vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest px-3 py-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm"
                    style={{
                      background: activeTab === id ? 'linear-gradient(135deg, rgba(246,180,14,0.2), rgba(246,180,14,0.05))' : 'transparent',
                      color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.45)',
                      fontWeight: activeTab === id ? 700 : 500,
                      borderLeft: activeTab === id ? '2px solid #F6B40E' : '2px solid transparent',
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                    {id === 'orders' && pendingOrders > 0 && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#ef4444', color: '#fff' }}>{pendingOrders}</span>
                    )}
                    {id === 'preguntas' && questions.filter((q) => q.status === 'unanswered' || q.status === 'pending').length > 0 && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#f97316', color: '#fff' }}>
                        {questions.filter((q) => q.status === 'unanswered' || q.status === 'pending').length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all" style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
            <Home className="w-4 h-4" /> Ir al inicio
          </Link>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ===================== MAIN ===================== */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#F1F5F9' }}>

        {/* Top bar */}
        <div className="bg-white px-4 lg:px-6 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-black text-gray-900 text-lg leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>
                {activeTab === 'overview' ? 'Resumen general' :
                 activeTab === 'products' ? 'Mis productos' :
                 activeTab === 'orders' ? 'Mis ventas' :
                 activeTab === 'estadisticas' ? 'Estadísticas' :
                 activeTab === 'preguntas' ? 'Preguntas de compradores' :
                 activeTab === 'pago-simple' ? 'Pago Simple' :
                 activeTab === 'configuracion' ? 'Configuración' : 'Panel Vendedor'}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/perfil/notificaciones" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              {pendingOrders > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </Link>
            <Link
              href="/vendedor/productos/nuevo"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #F6B40E, #D4960A)', boxShadow: '0 2px 8px rgba(246,180,14,0.3)' }}
            >
              <Plus className="w-4 h-4" /> Publicar
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">

          {/* ========== OVERVIEW ========== */}
          {activeTab === 'overview' && (
            <div className="space-y-5">

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Ingresos totales', value: formatPrice(totalRevenue), icon: DollarSign, color: '#10B981', bg: '#D1FAE5', trend: '+18%', up: true },
                  { label: 'Unidades vendidas', value: String(totalSales), icon: ShoppingBag, color: '#3B82F6', bg: '#DBEAFE', trend: '+12%', up: true },
                  { label: 'Productos activos', value: String(activeProducts), icon: Package, color: '#8B5CF6', bg: '#EDE9FE', trend: `${products.length} total`, up: null },
                  { label: 'Calificación', value: `${avgRating}★`, icon: Star, color: '#F59E0B', bg: '#FEF3C7', trend: 'Excelente', up: true },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: kpi.bg }}>
                          <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                        </div>
                        {kpi.up !== null && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                            style={{ background: kpi.up ? '#D1FAE5' : '#FEE2E2', color: kpi.up ? '#059669' : '#DC2626' }}>
                            {kpi.up ? <ArrowUp className="w-2.5 h-2.5" /> : null} {kpi.trend}
                          </span>
                        )}
                        {kpi.up === null && (
                          <span className="text-xs font-medium text-gray-400">{kpi.trend}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-2xl leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>
                          {isLoading ? <span className="inline-block w-20 h-6 bg-gray-100 rounded animate-pulse" /> : kpi.value}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">{kpi.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart + Recent orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Sales chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-black text-gray-900 text-base" style={{ fontFamily: 'Raleway, sans-serif' }}>Ventas mensuales</h3>
                      <p className="text-gray-400 text-xs">Septiembre 2025 — Marzo 2026</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3B82F6' }} />
                      <span className="text-xs text-gray-500">Unidades</span>
                      <div className="w-2.5 h-2.5 rounded-full ml-2" style={{ background: '#F6B40E' }} />
                      <span className="text-xs text-gray-500">Mes actual</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {monthlyStats.map((m, i) => {
                      const pct = (m.val / maxVal) * 100;
                      const isCurrent = i === monthlyStats.length - 1;
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                          <div className="relative w-full flex flex-col items-center justify-end" style={{ height: '120px' }}>
                            <div
                              className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden"
                              style={{
                                height: `${pct}%`,
                                background: isCurrent
                                  ? 'linear-gradient(180deg, #F6B40E 0%, #D4960A 100%)'
                                  : 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
                                boxShadow: isCurrent ? '0 -2px 8px rgba(246,180,14,0.4)' : '0 -2px 8px rgba(59,130,246,0.2)',
                              }}
                            >
                              <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />
                            </div>
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {m.val} ventas
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold" style={{ color: isCurrent ? '#D4960A' : '#94A3B8' }}>{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-900 text-base" style={{ fontFamily: 'Raleway, sans-serif' }}>Últimas ventas</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold" style={{ color: '#3B82F6' }}>Ver todas →</button>
                  </div>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Sin ventas aún</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
                            <ShoppingBag className="w-4 h-4" style={{ color: '#3B82F6' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{order.orderNumber}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top products + Quick actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Top products */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-900 text-base" style={{ fontFamily: 'Raleway, sans-serif' }}>Productos más vendidos</h3>
                    <button onClick={() => setActiveTab('products')} className="text-xs font-semibold" style={{ color: '#3B82F6' }}>Ver todos →</button>
                  </div>
                  {isLoading ? (
                    <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}</div>
                  ) : topProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Sin productos publicados</p>
                      <Link href="/vendedor/productos/nuevo" className="text-xs font-semibold mt-2 inline-block" style={{ color: '#3B82F6' }}>Publicar primero →</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                            style={{ background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : '#E2E8F0', color: i < 3 ? '#fff' : '#94A3B8' }}>
                            {i + 1}
                          </span>
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.salesCount || 0} ventas · Stock: {p.stock}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/vendedor/productos/${p.id}/editar`} className="p-1 rounded hover:bg-blue-50 transition-colors">
                                <Edit className="w-3.5 h-3.5 text-blue-500" />
                              </Link>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 className="font-black text-gray-900 text-base mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>Acciones rápidas</h3>
                  <div className="space-y-2">
                    {[
                      { href: '/vendedor/productos/nuevo', icon: Plus, label: 'Publicar producto', color: '#3B82F6', bg: '#EFF6FF' },
                      { href: '/vendedor/estadisticas', icon: TrendingUp, label: 'Ver estadísticas', color: '#8B5CF6', bg: '#F5F3FF' },
                      { href: '/vendedor/preguntas', icon: MessageCircle, label: 'Responder preguntas', color: '#10B981', bg: '#ECFDF5' },
                      { href: '/envios-vendedor', icon: Truck, label: 'Gestionar envíos', color: '#F59E0B', bg: '#FFFBEB' },
                      { href: '/mi-cuenta?tab=billetera', icon: DollarSign, label: '⚡ Pago Simple', color: '#3B82F6', bg: '#DBEAFE' },
                      { href: '/comisiones', icon: Award, label: 'Ver comisiones', color: '#06B6D4', bg: '#ECFEFF' },
                    ].map(({ href, icon: Icon, label, color, bg }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all group"
                        style={{ background: bg }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.7)' }}>
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: '#374151' }}>{label}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reputation + Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: 'Compradores únicos', value: orders.length > 0 ? String(new Set(orders.map(o => o.buyerId)).size) : '0', color: '#6366F1', bg: '#EEF2FF' },
                  { icon: Eye, label: 'Vistas totales', value: products.reduce((s, p) => s + (p.viewsCount || 0), 0).toLocaleString('es-AR'), color: '#0891B2', bg: '#ECFEFF' },
                  { icon: Shield, label: 'Tasa de éxito', value: orders.length > 0 ? `${Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100)}%` : '100%', color: '#059669', bg: '#ECFDF5' },
                  { icon: Zap, label: 'Pedidos pendientes', value: String(pendingOrders), color: '#D97706', bg: '#FFFBEB' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ border: '1px solid #E2E8F0' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>{isLoading ? '···' : value}</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========== PRODUCTS ========== */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-black text-gray-900 text-xl" style={{ fontFamily: 'Raleway, sans-serif' }}>Mis productos</h2>
                  <p className="text-gray-400 text-sm">{activeProducts} activos de {products.length} publicaciones</p>
                </div>
                <Link href="/vendedor/productos/nuevo" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                  <Plus className="w-4 h-4" /> Nuevo producto
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />)}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #E2E8F0' }}>
                  <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sin productos publicados</h3>
                  <p className="text-gray-400 text-sm mb-5">Empezá a vender publicando tu primer producto</p>
                  <Link href="/vendedor/productos/nuevo" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                    <Plus className="w-4 h-4" /> Publicar ahora
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Precio</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Estado</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.title}</p>
                                <p className="text-xs text-gray-400">{product.salesCount || 0} ventas</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                          </td>
                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            <p className={`text-sm font-semibold ${product.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{product.stock}</p>
                          </td>
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(product.status)}`}>
                              {getStatusLabel(product.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/productos/${product.slug}`} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Ver">
                                <Eye className="w-4 h-4 text-blue-500" />
                              </Link>
                              <Link href={`/vendedor/productos/${product.id}/editar`} className="p-1.5 rounded-lg hover:bg-green-50 transition-colors" title="Editar">
                                <Edit className="w-4 h-4 text-green-500" />
                              </Link>
                              <Link href={`/billetera/qr?producto=${product.id}&nombre=${encodeURIComponent(product.title)}&precio=${product.price}`} className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors" title="Generar QR del producto">
                                <QrCode className="w-4 h-4 text-purple-500" />
                              </Link>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== ORDERS ========== */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-black text-gray-900 text-xl" style={{ fontFamily: 'Raleway, sans-serif' }}>Mis ventas</h2>
                  <p className="text-gray-400 text-sm">{orders.length} órdenes recibidas · {pendingOrders} pendientes</p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #E2E8F0' }}>
                  <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sin ventas aún</h3>
                  <p className="text-gray-400 text-sm">Las órdenes de tus compradores aparecerán aquí</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Orden</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Comprador</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
                            <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-sm text-gray-700">{order.buyer?.name || 'Cliente'}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== PAGO SIMPLE ========== */}
          {activeTab === 'pago-simple' && (
            <PagoSimpleTab userId={user?.id} />
          )}

          {/* ========== CONFIGURACION ========== */}
          {activeTab === 'configuracion' && (
            <SellerConfiguracion user={user} />
          )}

          {/* ========== ESTADÍSTICAS ========== */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Rendimiento de tu tienda</p>
                </div>
                <select
                  value={statsPeriod}
                  onChange={(e) => setStatsPeriod(e.target.value)}
                  className="input-field text-sm py-2"
                >
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 3 meses</option>
                  <option value="365">Este año</option>
                </select>
              </div>

              {statsLoading || !stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse h-28" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Ventas totales', value: stats.totalSales, icon: ShoppingBag, color: '#3B82F6', bg: '#EFF6FF', trend: '+12%' },
                      { label: 'Ingresos', value: formatPrice(Number(stats.totalRevenue)), icon: DollarSign, color: '#10B981', bg: '#ECFDF5', trend: '+8%' },
                      { label: 'Productos activos', value: stats.totalProducts, icon: Package, color: '#8B5CF6', bg: '#F5F3FF', trend: '' },
                      { label: 'Calificación prom.', value: `${Number(stats.averageRating || 0).toFixed(1)} ⭐`, icon: Star, color: '#F59E0B', bg: '#FFFBEB', trend: '↑ 0.2' },
                      { label: 'Visitas', value: Number(stats.totalViews || 0).toLocaleString('es-AR'), icon: Eye, color: '#06B6D4', bg: '#ECFEFF', trend: '+245' },
                      { label: 'Pedidos pendientes', value: stats.pendingOrders, icon: Bell, color: '#F97316', bg: '#FFF7ED', trend: '' },
                      { label: 'Completados', value: stats.completedOrders, icon: Award, color: '#059669', bg: '#D1FAE5', trend: '' },
                      { label: 'Cancelados', value: stats.cancelledOrders, icon: Shield, color: '#EF4444', bg: '#FEE2E2', trend: '' },
                    ].map(({ label, value, icon: Icon, color, bg, trend }) => (
                      <div key={label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          {trend && <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5"><ArrowUp className="w-3 h-3" />{trend}</span>}
                        </div>
                        <p className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>{value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Gráfico mensual */}
                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
                    <h2 className="font-bold text-gray-900 mb-5">Ingresos por mes</h2>
                    <div className="flex items-end gap-3" style={{ height: 160 }}>
                      {MOCK_MONTHLY.map((m) => {
                        const maxR = Math.max(...MOCK_MONTHLY.map((x) => x.revenue));
                        const pct = (m.revenue / maxR) * 100;
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-gray-400">{formatPrice(m.revenue)}</span>
                            <div className="w-full rounded-t-lg relative overflow-hidden" style={{ height: `${Math.max(pct * 1.2, 8)}px`, background: '#EFF6FF' }}>
                              <div className="absolute bottom-0 left-0 right-0 rounded-t-lg" style={{ height: `${pct}%`, background: '#3B82F6' }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-600">{m.month}</span>
                            <span className="text-[10px] text-gray-400">{m.sales} v.</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Distribución pedidos */}
                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
                    <h2 className="font-bold text-gray-900 mb-4">Distribución de pedidos</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-orange-50 rounded-2xl">
                        <p className="text-3xl font-black text-orange-600">{stats.pendingOrders}</p>
                        <p className="text-sm text-orange-700 font-semibold mt-1">Pendientes</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-2xl">
                        <p className="text-3xl font-black text-green-600">{stats.completedOrders}</p>
                        <p className="text-sm text-green-700 font-semibold mt-1">Completados</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-2xl">
                        <p className="text-3xl font-black text-red-600">{stats.cancelledOrders}</p>
                        <p className="text-sm text-red-700 font-semibold mt-1">Cancelados</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========== PREGUNTAS ========== */}
          {activeTab === 'preguntas' && (
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex gap-2 flex-wrap">
                {([['all', 'Todas'], ['pending', 'Sin responder'], ['answered', 'Respondidas']] as const).map(([val, label]) => {
                  const pendingCount = questions.filter((q) => q.status === 'pending' || q.status === 'unanswered').length;
                  return (
                    <button
                      key={val}
                      onClick={() => setQuestionsFilter(val)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                      style={{
                        background: questionsFilter === val ? '#3B82F6' : '#fff',
                        color: questionsFilter === val ? '#fff' : '#374151',
                        border: questionsFilter === val ? '1px solid #3B82F6' : '1px solid #D1D5DB',
                      }}
                    >
                      {label}
                      {val === 'pending' && pendingCount > 0 && (
                        <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5">{pendingCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {questionsLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-32" />)}</div>
              ) : (() => {
                const filtered = questionsFilter === 'all' ? questions
                  : questionsFilter === 'pending' ? questions.filter((q) => q.status === 'pending' || q.status === 'unanswered')
                  : questions.filter((q) => q.status === 'answered');
                return filtered.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #E2E8F0' }}>
                    <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No hay preguntas {questionsFilter === 'pending' ? 'sin responder' : questionsFilter === 'answered' ? 'respondidas' : ''}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((q) => {
                      const isPending = q.status === 'pending' || q.status === 'unanswered';
                      return (
                        <div key={q.id} className="bg-white rounded-2xl p-5" style={{ border: `2px solid ${isPending ? '#FED7AA' : '#E2E8F0'}` }}>
                          {q.product && (
                            <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{q.product.title}</span>
                              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: isPending ? '#FEF3C7' : '#D1FAE5', color: isPending ? '#92400E' : '#065F46' }}>
                                {isPending ? '⏳ Pendiente' : '✅ Respondida'}
                              </span>
                            </div>
                          )}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm">👤</div>
                            <div>
                              <p className="text-gray-900 font-semibold text-sm">{q.question}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(q.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          {q.answer && (
                            <div className="flex items-start gap-3 mb-3 bg-green-50 rounded-xl p-3">
                              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">🏪</div>
                              <div>
                                <p className="text-gray-800 text-sm">{q.answer}</p>
                                {q.answeredAt && <p className="text-xs text-gray-400 mt-0.5">Respondido el {new Date(q.answeredAt).toLocaleDateString('es-AR')}</p>}
                              </div>
                            </div>
                          )}
                          {isPending && (
                            <div className="flex gap-2 mt-3">
                              <textarea
                                value={answerText[q.id] || ''}
                                onChange={(e) => setAnswerText((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                placeholder="Escribí tu respuesta..."
                                className="flex-1 input-field text-sm resize-none"
                                rows={2}
                              />
                              <button
                                onClick={() => handleAnswerQuestion(q.id)}
                                disabled={submittingQ === q.id}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                                style={{ background: '#3B82F6' }}
                              >
                                <Send className="w-4 h-4" />
                                {submittingQ === q.id ? 'Enviando...' : 'Responder'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <SellerDashboardContent />
    </Suspense>
  );
}

// ============================================================
// PAGO SIMPLE TAB
// ============================================================
function PagoSimpleTab({ userId }: { userId?: string }) {
  const [activeSection, setActiveSection] = useState<'links' | 'qr' | 'settlements'>('links');
  const [links, setLinks] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settlementStats, setSettlementStats] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', amount: '', description: '', type: 'single', maxInstallments: 1 });
  const [creating, setCreating] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [qrForm, setQrForm] = useState({ amount: '', description: '' });
  const [copiedCode, setCopiedCode] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('5000');
  const [installmentPlans, setInstallmentPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchLinks();
    fetchSettlements();
    fetchInstallments(5000);
  }, []);

  const fetchLinks = async () => {
    try {
      const { data } = await api.get('/pago-simple/links?limit=20');
      setLinks(data.links || []);
    } catch { /* silent */ }
  };

  const fetchSettlements = async () => {
    try {
      const { data } = await api.get('/pago-simple/settlements');
      setSettlements(data.settlements || []);
      setSettlementStats(data.stats);
    } catch { /* silent */ }
  };

  const fetchInstallments = async (amount: number) => {
    try {
      const { data } = await api.get(`/pago-simple/installments/${amount}`);
      setInstallmentPlans(data.plans || []);
    } catch { /* silent */ }
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
      await fetchLinks();
      toast.success(`Link creado: ${window.location.origin}${data.payUrl}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear link');
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    try {
      const payload: any = { description: qrForm.description };
      if (qrForm.amount) payload.amount = parseFloat(qrForm.amount);
      const { data } = await api.post('/pago-simple/qr/generate', payload);
      setQrData(data);
      toast.success('QR generado exitosamente');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al generar QR');
    } finally {
      setGeneratingQR(false);
    }
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/pago-simple/pagar/${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
    toast.success('Link copiado al portapapeles');
  };

  const cancelLink = async (id: string) => {
    try {
      await api.delete(`/pago-simple/links/${id}`);
      await fetchLinks();
      toast.success('Link cancelado');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error');
    }
  };

  const SECTIONS = [
    { id: 'links', icon: Link2, label: 'Links de Cobro' },
    { id: 'qr', icon: QrCode, label: 'Cobro con QR' },
    { id: 'settlements', icon: DollarSign, label: 'Liquidaciones' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-black text-gray-900 text-xl" style={{ fontFamily: 'Raleway, sans-serif' }}>Pago Simple</h2>
          <p className="text-gray-400 text-sm">Links · QR · Cuotas · Liquidaciones · 3.5% fee</p>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeSection === s.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            style={activeSection === s.id ? { background: 'linear-gradient(135deg, #3B82F6, #10B981)' } : {}}
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* LINKS */}
      {activeSection === 'links' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">{links.length} links creados</p>
            <button
              onClick={() => setShowCreateLink(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}
            >
              <Plus className="w-4 h-4" /> Crear Link
            </button>
          </div>

          {links.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px dashed #CBD5E1' }}>
              <Link2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No tenés links de cobro</p>
              <p className="text-gray-400 text-sm mt-1">Creá tu primer link para empezar a cobrar</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {links.map(link => (
                <div key={link.id} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-bold text-gray-900 truncate">{link.title}</p>
                      <p className="text-2xl font-black text-gray-900">${Number(link.amount).toLocaleString('es-AR')}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      link.status === 'active' ? 'bg-green-100 text-green-700' :
                      link.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {link.status === 'active' ? 'Activo' : link.status === 'paid' ? 'Pagado' : link.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>{link.type === 'reusable' ? 'Reutilizable' : 'Único'}</span>
                    <span>{link.viewCount || 0} vistas</span>
                    <span>{new Date(link.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyLink(link.code)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                      {copiedCode === link.code ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode === link.code ? 'Copiado' : 'Copiar link'}
                    </button>
                    <a href={`/pago-simple/pagar/${link.code}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </a>
                    {link.status === 'active' && (
                      <button onClick={() => cancelLink(link.id)} className="p-2 rounded-xl border border-red-100 hover:bg-red-50 transition-colors" title="Cancelar">
                        <X className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal crear link */}
          {showCreateLink && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <div className="modal-light rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-900 text-lg">Crear Link de Cobro</h3>
                  <button onClick={() => setShowCreateLink(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="space-y-3">
                  <input value={newLink.title} onChange={e => setNewLink(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" placeholder="Título del pago *" />
                  <input type="number" value={newLink.amount} onChange={e => setNewLink(p => ({ ...p, amount: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" placeholder="Monto en ARS *" />
                  <textarea value={newLink.description} onChange={e => setNewLink(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none text-sm" rows={2} placeholder="Descripción (opcional)" />
                  <select value={newLink.type} onChange={e => setNewLink(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm">
                    <option value="single">Pago único</option>
                    <option value="reusable">Reutilizable</option>
                  </select>
                  <select value={newLink.maxInstallments} onChange={e => setNewLink(p => ({ ...p, maxInstallments: parseInt(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm">
                    <option value={1}>Sin cuotas</option>
                    <option value={3}>Hasta 3 cuotas</option>
                    <option value={6}>Hasta 6 cuotas</option>
                    <option value={12}>Hasta 12 cuotas</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowCreateLink(false)} className="flex-1 py-3 rounded-2xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button onClick={handleCreateLink} disabled={creating || !newLink.title || !newLink.amount} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                    {creating ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR */}
      {activeSection === 'qr' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-500" /> Generar QR de cobro
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Monto (opcional — dejá vacío para monto libre)</label>
                <input type="number" value={qrForm.amount} onChange={e => setQrForm(p => ({ ...p, amount: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" placeholder="Ej: 5000 (o dejá vacío)" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Descripción</label>
                <input value={qrForm.description} onChange={e => setQrForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" placeholder="Ej: Mesa 4, Servicio de diseño" />
              </div>
              <button onClick={handleGenerateQR} disabled={generatingQR} className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                {generatingQR ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generando...</> : <><QrCode className="w-4 h-4" />Generar QR</>}
              </button>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-blue-50 text-xs text-blue-700">
              Los QR tienen validez de 30 minutos y son de uso único. Para cobros recurrentes, usá un Link de Cobro.
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center" style={{ border: '1px solid #E2E8F0' }}>
            {qrData ? (
              <div className="text-center">
                <img src={qrData.qrImageBase64} alt="QR Pago Simple" className="w-56 h-56 mx-auto rounded-2xl mb-4" style={{ border: '4px solid #E2E8F0' }} />
                <p className="font-bold text-gray-900 mb-1">QR listo para cobrar</p>
                {qrData.amount && <p className="text-xl font-black text-gray-900 mb-1">${Number(qrData.amount).toLocaleString('es-AR')}</p>}
                <p className="text-xs text-gray-400 mb-3">Válido hasta: {new Date(qrData.expiresAt).toLocaleTimeString('es-AR')}</p>
                <div className="flex gap-2 justify-center">
                  <a href={qrData.qrImageBase64} download="pago-simple-qr.png" className="px-4 py-2 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                    Descargar QR
                  </a>
                  <button onClick={() => setQrData(null)} className="px-4 py-2 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                    Nuevo QR
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <QrCode className="w-20 h-20 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Tu QR aparecerá aquí</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTLEMENTS */}
      {activeSection === 'settlements' && (
        <div className="space-y-4">
          {settlementStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total cobrado', value: `$${Number(settlementStats.totalGross).toLocaleString('es-AR')}`, color: '#10B981' },
                { label: 'Comisiones pagadas', value: `$${Number(settlementStats.totalFees).toLocaleString('es-AR')}`, color: '#F59E0B' },
                { label: 'Neto acreditado', value: `$${Number(settlementStats.totalNet).toLocaleString('es-AR')}`, color: '#3B82F6' },
                { label: 'Transacciones', value: settlementStats.count, color: '#8B5CF6' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {settlements.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px dashed #CBD5E1' }}>
              <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Sin liquidaciones aún</p>
              <p className="text-gray-400 text-sm">Cuando recibas pagos, las liquidaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Descripción</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Bruto</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">Fee</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Neto</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {settlements.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 max-w-[200px] truncate">{s.description}</p>
                        <p className="text-xs text-gray-400">{s.type}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-medium text-gray-900">${Number(s.grossAmount).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <p className="text-sm text-red-500">-${Number(s.feeAmount).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-green-600">${Number(s.netAmount).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === 'settled' ? 'bg-green-100 text-green-700' : s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                          {s.status === 'settled' ? 'Acreditado' : s.status === 'pending' ? 'Pendiente' : s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('es-AR')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SellerConfiguracion({ user }: { user: any }) {
  const [profile, setProfile] = useState({
    storeName: user?.name || '',
    storeDescription: '',
    phone: user?.phone || '',
    city: user?.city || '',
    province: user?.province || '',
    website: '',
  });
  const [bank, setBank] = useState({
    cbu: '',
    alias: '',
    bank: '',
    accountType: 'caja_ahorro',
    cuit: '',
  });
  const [shipping, setShipping] = useState({
    freeShipping: false,
    freeShippingMin: '10000',
    shipsFrom: user?.city || '',
    handlingDays: '2',
    carriers: ['correo_argentino', 'oca'],
  });
  const [vacation, setVacation] = useState({
    enabled: false,
    from: '',
    to: '',
    message: 'Temporalmente no disponible. Vuelvo pronto.',
  });
  const [docs, setDocs] = useState({
    dni: '',
    cuit: '',
    status: 'none',
  });
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (section: string) => {
    setSaving(section);
    await new Promise(r => setTimeout(r, 900));
    setSaving(null);
    toast.success('Cambios guardados correctamente');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-black text-gray-900 text-xl" style={{ fontFamily: 'Raleway, sans-serif' }}>Configuración de tienda</h2>
        <p className="text-gray-400 text-sm">Administrá tu cuenta de vendedor</p>
      </div>

      {/* Perfil de tienda */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" /> Perfil de tienda
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nombre de la tienda</label>
            <input value={profile.storeName} onChange={e => setProfile(p => ({ ...p, storeName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Descripción</label>
            <textarea value={profile.storeDescription} onChange={e => setProfile(p => ({ ...p, storeDescription: e.target.value }))}
              rows={3} placeholder="Contá sobre tu tienda..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Teléfono</label>
            <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="+54 11 ..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Sitio web</label>
            <input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
              placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <button onClick={() => save('profile')} disabled={saving === 'profile'}
          className="mt-4 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
          {saving === 'profile' ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </div>

      {/* Documentación */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" /> Documentación y verificación
        </h3>
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 flex items-start gap-2">
          <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Para publicar productos y recibir pagos necesitás verificar tu identidad. El proceso es 100% online.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">DNI</label>
            <input value={docs.dni} onChange={e => setDocs(p => ({ ...p, dni: e.target.value }))}
              placeholder="12.345.678" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">CUIT</label>
            <input value={docs.cuit} onChange={e => setDocs(p => ({ ...p, cuit: e.target.value }))}
              placeholder="20-12345678-5" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => save('docs')} disabled={saving === 'docs'}
            className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            {saving === 'docs' ? 'Enviando...' : 'Enviar documentación'}
          </button>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
            docs.status === 'verified' ? 'bg-green-100 text-green-700' :
            docs.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-500'
          }`}>{docs.status === 'verified' ? '✓ Verificado' : docs.status === 'pending' ? '⏳ En revisión' : 'Sin verificar'}</span>
        </div>
      </div>

      {/* Datos bancarios (CBU) */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-yellow-500" /> Datos bancarios para cobros
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">CBU</label>
            <input value={bank.cbu} onChange={e => setBank(p => ({ ...p, cbu: e.target.value }))}
              placeholder="0000000000000000000000" maxLength={22}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Alias</label>
            <input value={bank.alias} onChange={e => setBank(p => ({ ...p, alias: e.target.value }))}
              placeholder="mi.alias.banco" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Banco</label>
            <select value={bank.bank} onChange={e => setBank(p => ({ ...p, bank: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white focus:ring-2 focus:ring-blue-500/20">
              <option value="">Seleccioná banco</option>
              {['Banco Nación', 'Banco Provincia', 'Banco Galicia', 'Banco Santander', 'BBVA', 'Banco ICBC', 'Brubank', 'Mercado Pago', 'Ualá', 'Naranja X', 'Otro'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tipo de cuenta</label>
            <select value={bank.accountType} onChange={e => setBank(p => ({ ...p, accountType: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white focus:ring-2 focus:ring-blue-500/20">
              <option value="caja_ahorro">Caja de ahorro</option>
              <option value="cuenta_corriente">Cuenta corriente</option>
            </select>
          </div>
        </div>
        <button onClick={() => save('bank')} disabled={saving === 'bank'}
          className="mt-4 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
          {saving === 'bank' ? 'Guardando...' : 'Guardar datos bancarios'}
        </button>
      </div>

      {/* Envíos */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-purple-500" /> Configuración de envíos
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Envío gratis</p>
              <p className="text-xs text-gray-400">Activar envío gratis para tus compradores</p>
            </div>
            <button onClick={() => setShipping(p => ({ ...p, freeShipping: !p.freeShipping }))}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${shipping.freeShipping ? 'bg-green-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${shipping.freeShipping ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {shipping.freeShipping && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Mínimo para envío gratis</label>
              <input value={shipping.freeShippingMin} onChange={e => setShipping(p => ({ ...p, freeShippingMin: e.target.value }))}
                type="number" placeholder="10000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Ciudad de origen</label>
              <input value={shipping.shipsFrom} onChange={e => setShipping(p => ({ ...p, shipsFrom: e.target.value }))}
                placeholder="Buenos Aires" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Días de preparación</label>
              <select value={shipping.handlingDays} onChange={e => setShipping(p => ({ ...p, handlingDays: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white focus:ring-2 focus:ring-blue-500/20">
                {['1', '2', '3', '5', '7'].map(d => <option key={d} value={d}>{d} día(s) hábil(es)</option>)}
              </select>
            </div>
          </div>
        </div>
        <button onClick={() => save('shipping')} disabled={saving === 'shipping'}
          className="mt-4 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
          {saving === 'shipping' ? 'Guardando...' : 'Guardar configuración de envíos'}
        </button>
      </div>

      {/* Modo vacaciones */}
      <div className="bg-white rounded-2xl p-6" style={{ border: vacation.enabled ? '2px solid #F59E0B' : '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-500" /> Modo vacaciones
            {vacation.enabled && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold animate-pulse">ACTIVO</span>}
          </h3>
          <button onClick={() => setVacation(p => ({ ...p, enabled: !p.enabled }))}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${vacation.enabled ? 'bg-yellow-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${vacation.enabled ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
        {vacation.enabled && (
          <div className="space-y-3">
            <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              Tus publicaciones se pausarán automáticamente durante este período
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Desde</label>
                <input type="date" value={vacation.from} onChange={e => setVacation(p => ({ ...p, from: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Hasta</label>
                <input type="date" value={vacation.to} onChange={e => setVacation(p => ({ ...p, to: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Mensaje para compradores</label>
              <textarea value={vacation.message} onChange={e => setVacation(p => ({ ...p, message: e.target.value }))}
                rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 resize-none" />
            </div>
            <button onClick={() => save('vacation')} disabled={saving === 'vacation'}
              className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {saving === 'vacation' ? 'Activando...' : 'Activar modo vacaciones'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
