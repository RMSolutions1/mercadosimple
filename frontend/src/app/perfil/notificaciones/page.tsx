'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, ArrowLeft, CheckCircle, Trash2, Package, CreditCard, MessageCircle, Star, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, any> = {
  order_created: Package,
  order_shipped: Truck,
  order_delivered: CheckCircle,
  payment_received: CreditCard,
  message_received: MessageCircle,
  review_received: Star,
  system: Bell,
  promotion: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  order_created: 'bg-blue-100 text-blue-600',
  order_shipped: 'bg-orange-100 text-orange-600',
  order_delivered: 'bg-green-100 text-green-600',
  payment_received: 'bg-emerald-100 text-emerald-600',
  message_received: 'bg-purple-100 text-purple-600',
  review_received: 'bg-yellow-100 text-yellow-600',
  system: 'bg-gray-100 text-gray-600',
  promotion: 'bg-red-100 text-red-600',
};

export default function NotificacionesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login?returnUrl=' + encodeURIComponent('/perfil/notificaciones')); return; }
    loadNotifications();
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const r = await api.get('/notifications?limit=50');
      setNotifications(r.data.notifications || []);
    } catch {
      toast.error('Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('Todas marcadas como leídas');
  };

  const deleteNotif = async (id: string) => {
    await api.delete(`/notifications/${id}`).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/perfil" className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
                )}
              </h1>
              <p className="text-gray-500 text-sm">{notifications.length} notificaciones</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-ms-blue text-sm font-semibold hover:underline">
              Marcar todas como leídas
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sin notificaciones</h3>
            <p className="text-gray-500">Cuando haya novedades, aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] || Bell;
              const colorClass = TYPE_COLORS[notif.type] || 'bg-gray-100 text-gray-600';
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all ${
                    !notif.isRead ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-semibold text-sm ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                          {!notif.isRead && <span className="inline-block w-2 h-2 bg-ms-blue rounded-full ml-2 align-middle" />}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                          className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{notif.body}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
