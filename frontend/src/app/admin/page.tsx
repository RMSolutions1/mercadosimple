'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Package, ShoppingBag, DollarSign, TrendingUp, CheckCircle, XCircle,
  BarChart2, Activity, Shield, AlertTriangle, Eye, Lock, Unlock, Search,
  UserCheck, UserX, RefreshCw, Wallet, FileText, Settings, LogOut, Bell,
  ChevronRight, Star, Filter, MoreVertical, Snowflake, Ban, ArrowUpDown,
  MessageSquare, Download, ArrowUpRight, ArrowDownLeft, Zap, Globe,
  ChevronDown, Edit, TrendingDown, BarChart3, PieChart as PieIcon,
  Clock, CheckSquare, AlertOctagon, Send, Mail, CreditCard, Hash,
  UserCog, Database, Server, Percent,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { SolMayo } from '@/components/ui/SolMayo';
import { formatPrice, getStatusLabel, getStatusColor, formatDate } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

type AdminTab = 'overview' | 'users' | 'wallets' | 'transactions' | 'deposits' | 'products' | 'orders' | 'disputes' | 'reports' | 'settings';

const SIDEBAR_ITEMS: { key: AdminTab; icon: any; label: string; badge?: string; group?: string }[] = [
  { key: 'overview',      icon: BarChart2,     label: 'Panel de control',    group: 'Principal' },
  { key: 'users',         icon: Users,         label: 'Usuarios',            group: 'Gestión' },
  { key: 'wallets',       icon: Wallet,        label: 'Billeteras',          group: 'Finanzas' },
  { key: 'deposits',      icon: ArrowDownLeft, label: 'Cargas pendientes',   group: 'Finanzas' },
  { key: 'transactions',  icon: ArrowUpDown,   label: 'Transacciones',       group: 'Finanzas' },
  { key: 'products',      icon: Package,       label: 'Productos',           group: 'Marketplace' },
  { key: 'orders',        icon: ShoppingBag,   label: 'Órdenes',             group: 'Marketplace' },
  { key: 'disputes',      icon: AlertTriangle, label: 'Disputas',            group: 'Soporte' },
  { key: 'reports',       icon: TrendingUp,    label: 'Reportes',            group: 'Análisis' },
  { key: 'settings',      icon: Settings,      label: 'Configuración',       group: 'Sistema' },
];

const PIE_COLORS = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  admin:  { label: '👑 Admin',      color: '#EF4444', bg: '#FEF2F2' },
  seller: { label: '🏪 Vendedor',   color: '#10B981', bg: '#ECFDF5' },
  buyer:  { label: '👤 Comprador',  color: '#3B82F6', bg: '#EFF6FF' },
};

const VERIFICATION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: '✓ Verificado', color: '#10B981', bg: '#ECFDF5' },
  pending:  { label: '⏳ Pendiente',  color: '#F59E0B', bg: '#FFFBEB' },
  rejected: { label: '✗ Rechazado',  color: '#EF4444', bg: '#FEF2F2' },
  none:     { label: 'Sin verificar', color: '#6B7280', bg: '#F9FAFB' },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [metrics, setMetrics]         = useState<any>(null);
  const [reports, setReports]         = useState<any>(null);
  const [users, setUsers]             = useState<any[]>([]);
  const [products, setProducts]       = useState<any[]>([]);
  const [orders, setOrders]           = useState<any[]>([]);
  const [wallets, setWallets]         = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [activeTab, setActiveTab]     = useState<AdminTab>('overview');
  const [mounted, setMounted]         = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filtros
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('');

  // Modal usuario
  const [selectedUser, setSelectedUser]   = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [adjustAmount, setAdjustAmount]   = useState('');
  const [adjustReason, setAdjustReason]   = useState('');
  const [freezeReason, setFreezeReason]   = useState('');
  const [retainAmount, setRetainAmount]   = useState('');
  const [retainReason, setRetainReason]   = useState('');
  const [verifyNotes, setVerifyNotes]     = useState('');
  const [adminNotes, setAdminNotes]       = useState('');
  const [newRole, setNewRole]             = useState('');

  // Órdenes
  const [selectedOrder, setSelectedOrder]   = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNewStatus, setOrderNewStatus] = useState('');
  const [orderAdminNote, setOrderAdminNote] = useState('');

  // Depósitos pendientes de aprobación
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [depositTotal, setDepositTotal]       = useState(0);
  const [rejectReason, setRejectReason]       = useState('');
  const [rejectTarget, setRejectTarget]       = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/auth/login'); return; }
    fetchAll();
  }, [isAuthenticated, user, mounted]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, usersRes, productsRes, ordersRes, walletsRes, txRes, reportsRes, depositsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users?limit=100'),
        api.get('/admin/products?limit=100'),
        api.get('/admin/orders?limit=100'),
        api.get('/admin/wallets?limit=100'),
        api.get('/admin/transactions?limit=50'),
        api.get('/admin/reports').catch(() => ({ data: null })),
        api.get('/admin/deposits/pending?limit=100').catch(() => ({ data: { deposits: [], total: 0 } })),
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data.users || []);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setWallets(walletsRes.data.wallets || []);
      setTransactions(txRes.data.transactions || []);
      if (reportsRes.data) setReports(reportsRes.data);
      setPendingDeposits(depositsRes.data.deposits || []);
      setDepositTotal(depositsRes.data.total || 0);
    } catch { toast.error('Error al cargar datos del admin'); }
    finally { setIsLoading(false); }
  };

  const fetchPendingDeposits = async () => {
    setDepositsLoading(true);
    try {
      const { data } = await api.get('/admin/deposits/pending?limit=100');
      setPendingDeposits(data.deposits || []);
      setDepositTotal(data.total || 0);
    } catch { toast.error('Error al cargar depósitos pendientes'); }
    finally { setDepositsLoading(false); }
  };

  const handleApproveDeposit = async (id: string) => {
    try {
      const { data } = await api.patch(`/admin/deposits/${id}/approve`);
      toast.success(data.message || 'Depósito aprobado');
      setPendingDeposits(p => p.filter(d => d.id !== id));
      setDepositTotal(t => Math.max(0, t - 1));
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error al aprobar'); }
  };

  const handleRejectDeposit = async (id: string) => {
    if (!rejectReason.trim()) { toast.error('Ingresá un motivo de rechazo'); return; }
    try {
      const { data } = await api.patch(`/admin/deposits/${id}/reject`, { notes: rejectReason });
      toast.success(data.message || 'Depósito rechazado');
      setPendingDeposits(p => p.filter(d => d.id !== id));
      setDepositTotal(t => Math.max(0, t - 1));
      setRejectTarget('');
      setRejectReason('');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error al rechazar'); }
  };

  const openUserModal = async (u: any) => {
    if (!u) return;
    setSelectedUser(u);
    setAdminNotes(u.adminNotes || '');
    setNewRole(u.role || 'buyer');
    setShowUserModal(true);
    try {
      const { data } = await api.get(`/admin/users/${u.id}`);
      setSelectedUser(data);
      setAdminNotes(data.adminNotes || '');
      setNewRole(data.role || 'buyer');
    } catch {}
  };

  const handleToggleUser = async (userId: string) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success(data.message);
      setUsers(p => p.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u));
      if (selectedUser?.id === userId) setSelectedUser((p: any) => ({ ...p, isActive: data.isActive }));
    } catch { toast.error('Error al cambiar estado'); }
  };

  const handleChangeRole = async (userId: string) => {
    if (!newRole) return;
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(data.message);
      setUsers(p => p.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSelectedUser((p: any) => ({ ...p, role: newRole }));
    } catch { toast.error('Error al cambiar rol'); }
  };

  const handleVerify = async (userId: string, status: string) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/verification`, { status, notes: verifyNotes });
      toast.success(data.message);
      setUsers(p => p.map(u => u.id === userId ? { ...u, verificationStatus: status } : u));
      if (selectedUser?.id === userId) setSelectedUser((p: any) => ({ ...p, verificationStatus: status }));
      setVerifyNotes('');
    } catch { toast.error('Error al verificar'); }
  };

  const handleSaveNotes = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/notes`, { notes: adminNotes });
      toast.success('Notas guardadas');
    } catch { toast.error('Error al guardar notas'); }
  };

  const handleAdjustWallet = async (userId: string, isPositive: boolean) => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Ingresá un monto válido'); return; }
    if (amount > 9_999_999) { toast.error('Monto máximo: $9,999,999'); return; }
    if (!adjustReason.trim()) { toast.error('Ingresá el motivo'); return; }
    try {
      const finalAmount = isPositive ? amount : -amount;
      const { data } = await api.patch(`/admin/users/${userId}/wallet/adjust`, { amount: finalAmount, reason: adjustReason });
      toast.success(data.message);
      setAdjustAmount(''); setAdjustReason('');
      const { data: updated } = await api.get(`/admin/users/${userId}`);
      setSelectedUser(updated);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error al ajustar saldo'); }
  };

  const handleFreezeWallet = async (userId: string, freeze: boolean) => {
    if (freeze && !freezeReason) { toast.error('Ingresá un motivo para congelar'); return; }
    try {
      const { data } = await api.patch(`/admin/users/${userId}/wallet/freeze`, { freeze, reason: freezeReason });
      toast.success(data.message);
      setFreezeReason('');
      const { data: updated } = await api.get(`/admin/users/${userId}`);
      setSelectedUser(updated);
      setUsers(p => p.map(u => u.id === userId ? { ...u, walletFrozen: freeze } : u));
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleRetainBalance = async (userId: string) => {
    const amount = parseFloat(retainAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Ingresá un monto válido'); return; }
    if (!retainReason.trim()) { toast.error('Ingresá el motivo'); return; }
    try {
      const { data } = await api.patch(`/admin/users/${userId}/wallet/retain`, { amount, reason: retainReason });
      toast.success(data.message);
      setRetainAmount(''); setRetainReason('');
      const { data: updated } = await api.get(`/admin/users/${userId}`);
      setSelectedUser(updated);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error al retener saldo'); }
  };

  const handleReleaseBalance = async (userId: string) => {
    const amount = parseFloat(retainAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Ingresá un monto válido'); return; }
    try {
      const { data } = await api.patch(`/admin/users/${userId}/wallet/release`, { amount, reason: retainReason || 'Liberación manual' });
      toast.success(data.message);
      setRetainAmount(''); setRetainReason('');
      const { data: updated } = await api.get(`/admin/users/${userId}`);
      setSelectedUser(updated);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error al liberar saldo'); }
  };

  const handleProductAction = async (productId: string, action: 'approve' | 'pause') => {
    try {
      const { data } = await api.patch(`/admin/products/${productId}/${action}`);
      toast.success(data.message);
      setProducts(p => p.map(pr => pr.id === productId ? { ...pr, status: action === 'approve' ? 'active' : 'paused' } : pr));
    } catch { toast.error('Error al actualizar producto'); }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !orderNewStatus) return;
    try {
      const { data } = await api.patch(`/admin/orders/${selectedOrder.id}/status`, { status: orderNewStatus, adminNote: orderAdminNote });
      toast.success(data.message);
      setOrders(p => p.map(o => o.id === selectedOrder.id ? { ...o, status: orderNewStatus } : o));
      setShowOrderModal(false);
      setOrderAdminNote('');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error al actualizar orden'); }
  };

  if (!mounted || !isAuthenticated || user?.role !== 'admin') return null;

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredTransactions = transactions.filter(tx =>
    !txTypeFilter || tx.type === txTypeFilter
  );

  const chartData = metrics?.salesByMonth?.map((item: any) => ({
    month: new Date(item.month).toLocaleDateString('es-AR', { month: 'short' }),
    ventas: parseInt(item.count || 0),
    ingresos: parseFloat(item.revenue || 0),
  })).reverse() || [];

  const disputedOrders = orders.filter((o: any) => o.status === 'disputed');
  const pendingOrders  = orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed');
  const totalBalance   = wallets.reduce((s: number, w: any) => s + Number(w.balance || 0), 0);
  const frozenWallets  = wallets.filter((w: any) => w.isFrozen).length;

  const TAB_TITLES: Record<AdminTab, string> = {
    overview:     'Panel de control',
    users:        'Gestión de usuarios',
    wallets:      'Gestión de billeteras',
    deposits:     'Cargas de saldo — Aprobación manual',
    transactions: 'Transacciones del sistema',
    products:     'Gestión de productos',
    orders:       'Gestión de órdenes',
    disputes:     'Disputas y reclamos',
    reports:      'Reportes avanzados',
    settings:     'Configuración de la plataforma',
  };

  return (
    <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
      {/* ═══════ SIDEBAR ═══════ */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 flex flex-col transition-all duration-300`}
        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <SolMayo size={28} />
              <div>
                <div className="text-white font-black text-sm tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  MERCADO<span style={{ color: '#F6B40E' }}> SIMPLE</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  ADMIN
                </div>
              </div>
            </div>
          )}
          {sidebarCollapsed && <SolMayo size={28} className="mx-auto" />}
          <button onClick={() => setSidebarCollapsed(p => !p)} className="text-white/40 hover:text-white p-1 rounded ml-auto">
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Admin info */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 mx-3 mt-3 rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">Administrador</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {!sidebarCollapsed && <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Secciones</p>}
          {(() => {
            const groups = [...new Set(SIDEBAR_ITEMS.map(i => i.group || 'Otros'))];
            return groups.map(group => (
              <div key={group}>
                {!sidebarCollapsed && (
                  <p className="text-[9px] font-bold uppercase tracking-widest px-3 pt-3 pb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{group}</p>
                )}
                {SIDEBAR_ITEMS.filter(i => (i.group || 'Otros') === group).map(({ key, icon: Icon, label }) => {
                  const isActive = activeTab === key;
                  const badgeVal =
                    key === 'users' ? (metrics?.pendingVerifications || 0) :
                    key === 'disputes' ? disputedOrders.length :
                    key === 'deposits' ? depositTotal : 0;
                  return (
                    <button key={key} onClick={() => { setActiveTab(key); if (key === 'deposits') fetchPendingDeposits(); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                      title={sidebarCollapsed ? label : undefined}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${key === 'deposits' && depositTotal > 0 ? 'text-amber-400' : ''}`} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{label}</span>
                          {badgeVal > 0 && (
                            <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${key === 'deposits' ? 'bg-amber-500' : 'bg-red-500'}`}>
                              {badgeVal > 99 ? '99+' : badgeVal}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ));
          })()}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5 transition-all text-sm font-medium">
            <Globe className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Ver tienda</span>}
          </Link>
          <button onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <h1 className="text-base font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
            <p className="text-xs text-gray-400">Mercado Simple · Sistema Administrativo</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              En línea
            </div>
            <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Actualizar">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              {(metrics?.pendingVerifications > 0 || disputedOrders.length > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ══ OVERVIEW ══ */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Users,      label: 'Total usuarios',     value: metrics?.totalUsers || 0,                          sub: `${metrics?.pendingVerifications || 0} pendientes verificar`, color: '#3B82F6', bg: '#EFF6FF' },
                      { icon: Package,    label: 'Productos activos',  value: metrics?.totalProducts || 0,                        sub: `${products.filter((p: any) => p.status === 'active').length} en catálogo`, color: '#10B981', bg: '#ECFDF5' },
                      { icon: ShoppingBag,label: 'Total órdenes',      value: metrics?.totalOrders || 0,                          sub: `${pendingOrders.length} pendientes`, color: '#F59E0B', bg: '#FFFBEB' },
                      { icon: DollarSign, label: 'Ingresos totales',   value: formatPrice(metrics?.totalRevenue || 0),            sub: 'Pagos aprobados', color: '#8B5CF6', bg: '#F5F3FF' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                          </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-sm font-medium text-gray-700 mt-0.5">{stat.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Alert banners */}
                  {(metrics?.pendingVerifications > 0 || disputedOrders.length > 0 || frozenWallets > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { icon: UserCheck, label: 'Verificaciones pendientes', value: metrics?.pendingVerifications || 0, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', action: () => setActiveTab('users') },
                        { icon: Snowflake, label: 'Billeteras congeladas',     value: frozenWallets, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   action: () => setActiveTab('wallets') },
                        { icon: AlertTriangle, label: 'Disputas abiertas',     value: disputedOrders.length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', action: () => setActiveTab('disputes') },
                      ].filter(a => a.value > 0).map(alert => (
                        <button key={alert.label} onClick={alert.action}
                          className={`${alert.bg} border ${alert.border} rounded-2xl p-4 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform w-full`}>
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <alert.icon className={`w-6 h-6 ${alert.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-3xl font-black ${alert.color}`}>{alert.value}</p>
                            <p className="text-sm font-medium text-gray-700">{alert.label}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Second row - Wallet summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Saldo total en plataforma', value: formatPrice(totalBalance), icon: Wallet,    color: '#10B981', bg: '#ECFDF5' },
                      { label: 'Billeteras activas',        value: wallets.filter((w:any)=>!w.isFrozen).length, icon: CheckCircle, color: '#3B82F6', bg: '#EFF6FF' },
                      { label: 'Total transacciones',       value: transactions.length,        icon: ArrowUpDown, color: '#8B5CF6', bg: '#F5F3FF' },
                      { label: 'Productos en revisión',     value: products.filter((p:any)=>p.status==='paused').length, icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-500" /> Ventas por mes
                      </h3>
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(val: any, name: string) => [val, name === 'ventas' ? 'Ventas' : 'Ingresos']} />
                            <Area type="monotone" dataKey="ventas" stroke="#3B82F6" fill="url(#blueGrad)" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos de ventas aún</div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" /> Usuarios por rol
                      </h3>
                      {metrics?.usersByRole?.length > 0 && (
                        <ResponsiveContainer width="100%" height={120}>
                          <PieChart>
                            <Pie data={metrics.usersByRole.map((u: any) => ({ name: u.role, value: parseInt(u.count) }))}
                              cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                              {metrics.usersByRole.map((_: any, i: number) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      <div className="space-y-2 mt-2">
                        {(metrics?.usersByRole || []).map((item: any, i: number) => (
                          <div key={item.role} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-sm text-gray-700 capitalize">{item.role}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent orders */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-orange-500" /> Órdenes recientes
                      </h3>
                      <button onClick={() => setActiveTab('orders')} className="text-xs text-blue-500 hover:underline">Ver todas</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {(metrics?.recentOrders || []).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 font-mono">#{order.orderNumber?.slice(-8)}</p>
                            <p className="text-xs text-gray-500">{order.buyer?.name} · {order.items?.length} item(s)</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ USERS ══ */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-48 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                      <option value="">Todos los roles</option>
                      <option value="buyer">Compradores</option>
                      <option value="seller">Vendedores</option>
                      <option value="admin">Administradores</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-medium">{filteredUsers.length} usuarios</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Usuario</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Rol</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Verificación</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Estado</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Billetera</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Alta</th>
                            <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredUsers.map(u => {
                            const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.buyer;
                            const verif = VERIFICATION_LABELS[u.verificationStatus || 'none'] || VERIFICATION_LABELS.none;
                            return (
                              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                      style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                                      {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                      <p className="text-xs text-gray-500">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ color: roleInfo.color, background: roleInfo.bg }}>
                                    {roleInfo.label}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ color: verif.color, background: verif.bg }}>
                                    {verif.label}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {u.isActive ? '● Activo' : '● Inactivo'}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  {u.walletFrozen
                                    ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Snowflake className="w-3 h-3" /> Congelada</span>
                                    : <span className="text-xs text-gray-400">Normal</span>
                                  }
                                </td>
                                <td className="px-4 py-4">
                                  <span className="text-xs text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-AR') : '-'}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => openUserModal(u)}
                                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                    Gestionar
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>No se encontraron usuarios</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ WALLETS ══ */}
              {activeTab === 'wallets' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Billeteras activas',         value: wallets.filter((w:any)=>!w.isFrozen).length, icon: Wallet,     color: '#10B981', bg: '#ECFDF5' },
                      { label: 'Billeteras congeladas',      value: frozenWallets,                                icon: Snowflake,  color: '#3B82F6', bg: '#EFF6FF' },
                      { label: 'Saldo total en plataforma',  value: formatPrice(totalBalance),                   icon: DollarSign, color: '#8B5CF6', bg: '#F5F3FF' },
                      { label: 'Saldo promedio por usuario', value: formatPrice(wallets.length ? totalBalance / wallets.length : 0), icon: TrendingUp, color: '#F59E0B', bg: '#FFFBEB' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                          <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                        </div>
                        <p className="text-xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Todas las billeteras ({wallets.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Usuario</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">CVU</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Alias</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Saldo disponible</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Retenido</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Estado</th>
                            <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {wallets.map((w: any) => (
                            <tr key={w.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                                    {w.user?.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{w.user?.name}</p>
                                    <p className="text-xs text-gray-400">{w.user?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-xs font-mono text-gray-600">{w.cvu ? `${w.cvu.slice(0,8)}···` : '—'}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-xs font-semibold text-blue-600">{w.alias || '—'}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-gray-900">{formatPrice(Number(w.balance || 0))}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`text-sm font-semibold ${Number(w.frozenBalance) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                  {formatPrice(Number(w.frozenBalance || 0))}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                {w.isFrozen
                                  ? <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit"><Snowflake className="w-3 h-3" /> Congelada</span>
                                  : <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">Activa</span>
                                }
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => openUserModal(w.user)}
                                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                  Gestionar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ TRANSACTIONS ══ */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total transacciones',   value: transactions.length,  icon: ArrowUpDown,  color: '#3B82F6', bg: '#EFF6FF' },
                      { label: 'Depósitos',             value: transactions.filter((t:any)=>t.type==='deposit').length,    icon: ArrowDownLeft, color: '#10B981', bg: '#ECFDF5' },
                      { label: 'Retiros / Envíos',      value: transactions.filter((t:any)=>t.type==='withdrawal'||t.type==='transfer_out').length, icon: ArrowUpRight, color: '#EF4444', bg: '#FEF2F2' },
                      { label: 'Transferencias recibidas', value: transactions.filter((t:any)=>t.type==='transfer_in').length, icon: Zap, color: '#8B5CF6', bg: '#F5F3FF' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                          </div>
                          <div>
                            <p className="text-xl font-black text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
                      <h3 className="font-bold text-gray-900">Todas las transacciones</h3>
                      <select value={txTypeFilter} onChange={e => setTxTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                        <option value="">Todos los tipos</option>
                        <option value="deposit">Depósitos</option>
                        <option value="withdrawal">Retiros</option>
                        <option value="transfer_in">Transferencias recibidas</option>
                        <option value="transfer_out">Transferencias enviadas</option>
                        <option value="payment">Pagos</option>
                        <option value="refund">Reembolsos</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Usuario</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Tipo</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Monto</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Estado</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Descripción</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredTransactions.map((tx: any) => {
                            const isIn = tx.type === 'deposit' || tx.type === 'transfer_in' || tx.type === 'refund';
                            return (
                              <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3">
                                  <p className="text-sm font-medium text-gray-900">{tx.wallet?.user?.name || '—'}</p>
                                  <p className="text-xs text-gray-400">{tx.wallet?.user?.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-sm font-bold ${isIn ? 'text-green-600' : 'text-red-600'}`}>
                                    {isIn ? '+' : '-'}{formatPrice(Number(tx.amount))}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 max-w-xs">
                                  <p className="text-xs text-gray-600 truncate">{tx.description || '—'}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-AR') : '—'}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {filteredTransactions.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                          <ArrowUpDown className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>No hay transacciones registradas</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ PRODUCTS ══ */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Activos',    value: products.filter((p:any)=>p.status==='active').length,  color: '#10B981', bg: '#ECFDF5' },
                      { label: 'Pausados',   value: products.filter((p:any)=>p.status==='paused').length,  color: '#F59E0B', bg: '#FFFBEB' },
                      { label: 'Eliminados', value: products.filter((p:any)=>p.status==='deleted').length, color: '#EF4444', bg: '#FEF2F2' },
                      { label: 'Total',      value: products.length, color: '#3B82F6', bg: '#EFF6FF' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-sm text-gray-600">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Catálogo completo ({products.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {products.map((product: any) => (
                        <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                          <img src={product.images?.[0] || 'https://via.placeholder.com/48'}
                            alt={product.title}
                            className="w-12 h-12 object-contain bg-gray-100 rounded-xl p-1 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48'; }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.title}</p>
                            <p className="text-xs text-gray-500">{product.seller?.name} · {product.category?.name}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(product.price)}</p>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                            product.status === 'active' ? 'bg-green-100 text-green-700' :
                            product.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{getStatusLabel(product.status)}</span>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleProductAction(product.id, 'approve')}
                              className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Aprobar
                            </button>
                            <button onClick={() => handleProductAction(product.id, 'pause')}
                              className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1">
                              <Ban className="w-3 h-3" /> Pausar
                            </button>
                            <Link href={`/productos/${product.slug}`} target="_blank"
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Ver
                            </Link>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                          <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>No hay productos en el catálogo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ ORDERS ══ */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Pendientes',  value: orders.filter((o:any)=>o.status==='pending'||o.status==='confirmed').length, color: '#F59E0B' },
                      { label: 'En proceso',  value: orders.filter((o:any)=>o.status==='processing'||o.status==='shipped').length, color: '#3B82F6' },
                      { label: 'Entregadas',  value: orders.filter((o:any)=>o.status==='delivered').length, color: '#10B981' },
                      { label: 'Disputadas',  value: disputedOrders.length, color: '#EF4444' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-sm text-gray-600">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Todas las órdenes ({orders.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Orden</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Comprador</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Items</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Total</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Estado</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Fecha</th>
                            <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold font-mono text-gray-900">#{order.orderNumber?.slice(-8)}</p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-sm font-medium text-gray-900">{order.buyer?.name}</p>
                                <p className="text-xs text-gray-400">{order.buyer?.email}</p>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-gray-600">{order.items?.length} producto(s)</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-AR') : '-'}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => { setSelectedOrder(order); setOrderNewStatus(order.status); setShowOrderModal(true); }}
                                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                  Gestionar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ DEPOSITS PENDING APPROVAL ══ */}
              {activeTab === 'deposits' && (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Solicitudes pendientes', value: depositTotal, color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
                      { label: 'Total a acreditar', value: formatPrice(pendingDeposits.reduce((s,d)=>s+Number(d.amount),0)), color: '#3B82F6', bg: '#EFF6FF', icon: DollarSign, isPrice: true },
                      { label: 'Usuarios afectados', value: new Set(pendingDeposits.map(d=>d.user?.id)).size, color: '#10B981', bg: '#ECFDF5', icon: Users },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                          <s.icon className="w-5 h-5" style={{ color: s.color }} />
                        </div>
                        <div>
                          <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Descripción */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900 text-sm">Aprobación requerida</p>
                      <p className="text-amber-700 text-xs mt-0.5">
                        Los usuarios solicitaron cargar saldo a su cuenta Pago Simple. El dinero <strong>no fue acreditado</strong> aún.
                        Revisá la información y aprobá o rechazá cada solicitud. Las aprobadas se acreditarán al instante.
                      </p>
                    </div>
                  </div>

                  {/* Lista */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ArrowDownLeft className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-gray-900">Cargas pendientes de aprobación ({depositTotal})</h3>
                      </div>
                      <button onClick={fetchPendingDeposits} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1">
                        <RefreshCw className={`w-3 h-3 ${depositsLoading ? 'animate-spin' : ''}`} /> Actualizar
                      </button>
                    </div>

                    {depositsLoading && (
                      <div className="p-8 text-center text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Cargando solicitudes...</p>
                      </div>
                    )}

                    {!depositsLoading && pendingDeposits.length === 0 && (
                      <div className="p-12 text-center text-gray-400">
                        <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                        <p className="font-bold text-green-700">Sin solicitudes pendientes</p>
                        <p className="text-xs mt-1">Todas las cargas de saldo fueron procesadas.</p>
                      </div>
                    )}

                    {!depositsLoading && pendingDeposits.map(dep => (
                      <div key={dep.id} className="p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-600 text-lg flex-shrink-0">
                              {dep.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{dep.user?.name || 'Usuario desconocido'}</p>
                              <p className="text-xs text-gray-500">{dep.user?.email}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs font-mono text-gray-400">{dep.wallet?.alias}</span>
                                <span className="text-xs text-gray-400">·</span>
                                <span className="text-xs text-gray-500">Saldo actual: <strong>{formatPrice(dep.wallet?.currentBalance || 0)}</strong></span>
                                {dep.paymentMethod && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{dep.paymentMethod}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{dep.description}</p>
                              <p className="text-xs text-gray-300">{new Date(dep.createdAt).toLocaleString('es-AR')}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-black text-gray-900">{formatPrice(dep.amount)}</p>
                            <p className="text-xs text-amber-600 font-semibold">Pendiente de aprobación</p>
                          </div>
                        </div>

                        {/* Acciones */}
                        {rejectTarget === dep.id ? (
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Motivo de rechazo *"
                              className="flex-1 px-3 py-2 rounded-xl border-2 border-red-200 text-sm text-gray-900 bg-white outline-none focus:border-red-400"
                            />
                            <button onClick={() => handleRejectDeposit(dep.id)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
                              Confirmar rechazo
                            </button>
                            <button onClick={() => { setRejectTarget(''); setRejectReason(''); }}
                              className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-2">
                            <button onClick={() => handleApproveDeposit(dep.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors">
                              <CheckCircle className="w-4 h-4" /> Aprobar y acreditar
                            </button>
                            <button onClick={() => { setRejectTarget(dep.id); setRejectReason(''); }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors">
                              <XCircle className="w-4 h-4" /> Rechazar
                            </button>
                            <button onClick={() => openUserModal(users.find(u => u.id === dep.user?.id))}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50">
                              <Eye className="w-3.5 h-3.5" /> Ver usuario
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ DISPUTES ══ */}
              {activeTab === 'disputes' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Disputas abiertas',     value: disputedOrders.length,                                               color: '#EF4444', bg: '#FEF2F2' },
                      { label: 'Saldos bajo retención',  value: wallets.filter((w:any)=>Number(w.frozenBalance)>0).length,           color: '#F59E0B', bg: '#FFFBEB' },
                      { label: 'Órdenes sin entrega',   value: orders.filter((o:any)=>o.status==='processing').length,               color: '#3B82F6', bg: '#EFF6FF' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                        <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {disputedOrders.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                        <AlertOctagon className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-900">Órdenes en disputa activa</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {disputedOrders.map((order: any) => (
                          <div key={order.id} className="px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-mono font-bold text-gray-900">#{order.orderNumber?.slice(-8)}</span>
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">En disputa</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">Comprador: <span className="font-semibold">{order.buyer?.name}</span></p>
                                <p className="text-sm text-gray-700">Total: <span className="font-bold">{formatPrice(order.total)}</span></p>
                                <p className="text-xs text-gray-500 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-AR') : ''}</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button onClick={() => { setSelectedOrder(order); setOrderNewStatus('delivered'); setShowOrderModal(true); }}
                                  className="px-4 py-2 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Resolver a favor del comprador
                                </button>
                                <button onClick={() => { setSelectedOrder(order); setOrderNewStatus('cancelled'); setShowOrderModal(true); }}
                                  className="px-4 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Cancelar y reembolsar
                                </button>
                                <button onClick={() => openUserModal(order.buyer)}
                                  className="px-4 py-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors">
                                  Ver billetera del comprador
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="font-bold text-gray-900 text-lg mb-2">Sin disputas activas</h3>
                      <p className="text-gray-500 text-sm">La plataforma no tiene órdenes en disputa en este momento.</p>
                    </div>
                  )}

                  {/* Wallets con saldo retenido */}
                  {wallets.filter((w:any)=>Number(w.frozenBalance)>0).length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Snowflake className="w-5 h-5 text-blue-500" /> Saldos bajo retención por disputa
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {wallets.filter((w:any)=>Number(w.frozenBalance)>0).map((w:any) => (
                          <div key={w.id} className="flex items-center justify-between px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{w.user?.name}</p>
                              <p className="text-xs text-gray-500">{w.user?.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-bold text-red-600">{formatPrice(Number(w.frozenBalance))}</p>
                                <p className="text-xs text-gray-400">retenido</p>
                              </div>
                              <button onClick={() => openUserModal(w.user)}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg">
                                Gestionar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ REPORTS ══ */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Usuarios totales',      value: metrics?.totalUsers || 0,               icon: Users,      color: '#3B82F6' },
                      { label: 'Vendedores activos',    value: users.filter(u=>u.role==='seller').length, icon: Package,  color: '#10B981' },
                      { label: 'Ingresos plataforma',   value: formatPrice(metrics?.totalRevenue || 0), icon: DollarSign, color: '#8B5CF6' },
                      { label: 'Productos en catálogo', value: metrics?.totalProducts || 0,             icon: BarChart2, color: '#F59E0B' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <s.icon className="w-6 h-6 mb-2" style={{ color: s.color }} />
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-sm text-gray-600">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ventas por mes */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" /> Ventas por mes (últimos 6)
                      </h3>
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos aún</div>
                      )}
                    </div>

                    {/* Órdenes por estado */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieIcon className="w-5 h-5 text-green-500" /> Estado de órdenes
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Entregadas', value: orders.filter((o:any)=>o.status==='delivered').length, color: '#10B981' },
                          { label: 'Pendientes', value: orders.filter((o:any)=>o.status==='pending').length, color: '#F59E0B' },
                          { label: 'Procesando', value: orders.filter((o:any)=>o.status==='processing').length, color: '#3B82F6' },
                          { label: 'Canceladas', value: orders.filter((o:any)=>o.status==='cancelled').length, color: '#EF4444' },
                          { label: 'Disputadas', value: disputedOrders.length, color: '#8B5CF6' },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700">{item.label}</span>
                              <span className="text-sm font-bold text-gray-900">{item.value}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="rounded-full h-2 transition-all" style={{
                                width: `${orders.length > 0 ? (item.value / orders.length * 100) : 0}%`,
                                background: item.color
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top vendedores */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" /> Top vendedores
                      </h3>
                      <div className="space-y-3">
                        {users.filter(u=>u.role==='seller').sort((a:any,b:any)=>(b.totalSales||0)-(a.totalSales||0)).slice(0,5).map((seller, i) => (
                          <div key={seller.id} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : '#E5E7EB', color: i < 3 ? '#fff' : '#6B7280' }}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{seller.name}</p>
                              <p className="text-xs text-gray-500">{seller.totalSales || 0} ventas</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-semibold">{Number(seller.reputation || 0).toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verificaciones KYC */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-500" /> Estado de verificaciones KYC
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Verificados',    value: users.filter(u=>u.verificationStatus==='verified').length, color: '#10B981' },
                          { label: 'Pendientes',     value: users.filter(u=>u.verificationStatus==='pending').length,  color: '#F59E0B' },
                          { label: 'Rechazados',     value: users.filter(u=>u.verificationStatus==='rejected').length, color: '#EF4444' },
                          { label: 'Sin verificar',  value: users.filter(u=>!u.verificationStatus||u.verificationStatus==='none').length, color: '#9CA3AF' },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: `${item.color}10` }}>
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            <span className="text-lg font-black" style={{ color: item.color }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ SETTINGS ══ */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Comisiones */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Percent className="w-5 h-5 text-blue-500" /> Comisiones de la plataforma
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Comisión estándar por venta', value: '8%', desc: 'Aplicado a ventas Classic' },
                          { label: 'Comisión premium', value: '15%', desc: 'Aplicado a publicaciones Premium' },
                          { label: 'Comisión Pago Simple', value: '2.5%', desc: 'Cobros con link de pago y QR' },
                          { label: 'Retención por disputa', value: '100% del total', desc: 'Retención temporaria hasta resolución' },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <span className="text-base font-black text-blue-600">{item.value}</span>
                          </div>
                        ))}
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                          <Settings className="w-3 h-3" /> La edición de comisiones estará disponible en la próxima versión.
                        </p>
                      </div>
                    </div>

                    {/* Estado del sistema */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-green-500" /> Estado del sistema
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'API Backend',          status: 'Operativo', ok: true },
                          { label: 'Base de datos',        status: 'Operativo', ok: true },
                          { label: 'Servicio de pagos',    status: 'Operativo', ok: true },
                          { label: 'Billetera virtual',    status: 'Operativo', ok: true },
                          { label: 'Módulo Pago Simple',   status: 'Operativo', ok: true },
                          { label: 'Sistema de emails',    status: 'Simulado',  ok: false },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{item.label}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${item.ok ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Datos de la plataforma */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-500" /> Datos de la plataforma
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Versión del sistema',    value: 'v2.5.0' },
                          { label: 'Nombre de la plataforma', value: 'Mercado Simple' },
                          { label: 'Módulo financiero',      value: 'Pago Simple v1.0' },
                          { label: 'País de operación',      value: 'Argentina 🇦🇷' },
                          { label: 'Moneda principal',       value: 'ARS (Pesos Argentinos)' },
                          { label: 'Entorno',                value: process.env.NODE_ENV || 'development' },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                            <span className="text-sm text-gray-600">{item.label}</span>
                            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Acciones administrativas
                      </h3>
                      <div className="space-y-3">
                        <button onClick={() => { setActiveTab('users'); setRoleFilter(''); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-left">
                          <UserCog className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900">Gestionar usuarios</p>
                            <p className="text-xs text-blue-600">{users.length} usuarios registrados</p>
                          </div>
                        </button>
                        <button onClick={() => setActiveTab('disputes')}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Resolver disputas</p>
                            <p className="text-xs text-red-600">{disputedOrders.length} disputas abiertas</p>
                          </div>
                        </button>
                        <button onClick={fetchAll}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-left">
                          <RefreshCw className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">Actualizar datos</p>
                            <p className="text-xs text-green-600">Sincronizar con la base de datos</p>
                          </div>
                        </button>
                        <Link href="/" target="_blank"
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                          <Globe className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Ver tienda pública</p>
                            <p className="text-xs text-gray-500">Previsualizar la plataforma</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ═══════ MODAL: GESTIÓN DE USUARIO ═══════ */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-end">
          <div className="modal-light w-full max-w-lg h-full shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Estado y rol */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Estado cuenta</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.isActive ? '● Activo' : '● Inactivo'}
                    </span>
                    <button onClick={() => handleToggleUser(selectedUser.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        selectedUser.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}>
                      {selectedUser.isActive ? 'Bloquear' : 'Activar'}
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Rol actual</p>
                  <span className={`text-sm font-bold capitalize ${ROLE_LABELS[selectedUser.role]?.color ? '' : ''}`}
                    style={{ color: ROLE_LABELS[selectedUser.role]?.color }}>
                    {ROLE_LABELS[selectedUser.role]?.label || selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Cambio de rol */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-purple-500" /> Cambiar rol
                </h4>
                <div className="flex gap-2">
                  <select value={newRole} onChange={e => setNewRole(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="buyer">👤 Comprador</option>
                    <option value="seller">🏪 Vendedor</option>
                    <option value="admin">👑 Administrador</option>
                  </select>
                  <button onClick={() => handleChangeRole(selectedUser.id)}
                    disabled={newRole === selectedUser.role}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                    Cambiar
                  </button>
                </div>
              </div>

              {/* Info básica */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'DNI',            value: selectedUser.documentDni || 'No informado' },
                  { label: 'CUIT',           value: selectedUser.documentCuit || 'No informado' },
                  { label: 'Ciudad',         value: selectedUser.city || '-' },
                  { label: 'Provincia',      value: selectedUser.province || '-' },
                  { label: 'Teléfono',       value: selectedUser.phone || '-' },
                  { label: 'Miembro desde',  value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('es-AR') : '-' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-900 mt-0.5 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Verificación KYC */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" /> Verificación de identidad (KYC)
                </h4>
                <div className="mb-3">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{
                      color: VERIFICATION_LABELS[selectedUser.verificationStatus || 'none']?.color,
                      background: VERIFICATION_LABELS[selectedUser.verificationStatus || 'none']?.bg
                    }}>
                    {VERIFICATION_LABELS[selectedUser.verificationStatus || 'none']?.label}
                  </span>
                  {selectedUser.verificationNotes && (
                    <p className="text-xs text-gray-500 mt-2">Notas: {selectedUser.verificationNotes}</p>
                  )}
                </div>
                <textarea value={verifyNotes} onChange={e => setVerifyNotes(e.target.value)}
                  placeholder="Notas de verificación (opcional)..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none mb-3" rows={2} />
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(selectedUser.id, 'verified')}
                    className="flex-1 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Verificar
                  </button>
                  <button onClick={() => handleVerify(selectedUser.id, 'rejected')}
                    className="flex-1 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1">
                    <XCircle className="w-4 h-4" /> Rechazar
                  </button>
                  <button onClick={() => handleVerify(selectedUser.id, 'pending')}
                    className="flex-1 py-2 text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg">
                    Pendiente
                  </button>
                </div>
              </div>

              {/* Billetera */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-500" /> Gestión de billetera
                </h4>

                {selectedUser.wallet && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-semibold">Saldo disponible</p>
                      <p className="text-xl font-black text-blue-700">{formatPrice(Number(selectedUser.wallet?.balance || 0))}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-red-600 font-semibold">Saldo retenido</p>
                      <p className="text-xl font-black text-red-700">{formatPrice(Number(selectedUser.wallet?.frozenBalance || 0))}</p>
                    </div>
                    {selectedUser.wallet?.cvu && (
                      <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">CVU: <span className="font-mono font-semibold text-gray-700">{selectedUser.wallet.cvu}</span></p>
                        <p className="text-xs text-gray-500 mt-1">Alias: <span className="font-semibold text-blue-600">{selectedUser.wallet.alias}</span></p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ajustar saldo */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Ajustar saldo</p>
                  <input value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} type="number" placeholder="Monto (ej: 500)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Motivo del ajuste..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <div className="flex gap-2">
                    <button onClick={() => handleAdjustWallet(selectedUser.id, true)}
                      className="flex-1 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                      + Agregar saldo
                    </button>
                    <button onClick={() => handleAdjustWallet(selectedUser.id, false)}
                      className="flex-1 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                      − Quitar saldo
                    </button>
                  </div>
                </div>

                {/* Congelar */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Congelar billetera</p>
                  <input value={freezeReason} onChange={e => setFreezeReason(e.target.value)} placeholder="Motivo del congelamiento..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <div className="flex gap-2">
                    <button onClick={() => handleFreezeWallet(selectedUser.id, true)}
                      className="flex-1 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Snowflake className="w-4 h-4" /> Congelar
                    </button>
                    <button onClick={() => handleFreezeWallet(selectedUser.id, false)}
                      className="flex-1 py-2 text-sm font-semibold bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Unlock className="w-4 h-4" /> Descongelar
                    </button>
                  </div>
                </div>

                {/* Retener / Liberar saldo */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Retener / Liberar saldo por disputa</p>
                  <input value={retainAmount} onChange={e => setRetainAmount(e.target.value)} type="number" placeholder="Monto a retener/liberar..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input value={retainReason} onChange={e => setRetainReason(e.target.value)} placeholder="Motivo de la retención..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <div className="flex gap-2">
                    <button onClick={() => handleRetainBalance(selectedUser.id)}
                      className="flex-1 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                      Retener
                    </button>
                    <button onClick={() => handleReleaseBalance(selectedUser.id)}
                      className="flex-1 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                      Liberar
                    </button>
                  </div>
                </div>
              </div>

              {/* Notas del admin */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" /> Notas internas del administrador
                </h4>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Notas privadas sobre este usuario (no visibles para el usuario)..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" rows={3} />
                <button onClick={() => handleSaveNotes(selectedUser.id)}
                  className="mt-2 w-full py-2 text-sm font-semibold bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors">
                  Guardar notas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MODAL: GESTIÓN DE ORDEN ═══════ */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-light rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Gestionar orden #{selectedOrder.orderNumber?.slice(-8)}</h3>
                <button onClick={() => setShowOrderModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Comprador</p>
                  <p className="font-semibold">{selectedOrder.buyer?.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-blue-600">{formatPrice(selectedOrder.total)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nuevo estado</label>
                <select value={orderNewStatus} onChange={e => setOrderNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="disputed">En disputa</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nota interna (opcional)</label>
                <textarea value={orderAdminNote} onChange={e => setOrderAdminNote(e.target.value)}
                  placeholder="Notas sobre esta acción..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" rows={3} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleUpdateOrderStatus}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                  Actualizar estado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
