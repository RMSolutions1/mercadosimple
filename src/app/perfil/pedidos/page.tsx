'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, Truck, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import api from '@/lib/axios';

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?returnUrl=' + encodeURIComponent('/perfil/pedidos'));
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setError(null);
    try {
      const { data } = await api.get('/orders');
      setOrders(data.orders || []);
    } catch {
      setError('No pudimos cargar tus pedidos. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'shipped' || status === 'in_transit') return <Truck className="w-5 h-5 text-blue-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/perfil" className="text-gray-500 hover:text-gray-700 text-sm">Mi perfil</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">Mis pedidos</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-white rounded-xl border border-gray-200" />)}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-xl border border-red-200">
          <Package className="w-16 h-16 text-red-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ocurrió un error</h3>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <button onClick={fetchOrders} className="btn-primary">Reintentar</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenés pedidos aún</h3>
          <p className="text-gray-500 mb-6 text-sm">Cuando realices una compra, aparecerá aquí</p>
          <Link href="/productos" className="btn-primary">Explorar productos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-mono">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                </div>
              </div>

              {/* Order items */}
              <div className="p-4 space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.productImage || 'https://via.placeholder.com/48'}
                        alt={item.productTitle}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{item.productTitle}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity} · {formatPrice(item.unitPrice)} c/u</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 flex-shrink-0">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              {order.shipping && (
                <div className="px-4 pb-4">
                  <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-ms-blue" />
                    <span className="text-blue-700">
                      {order.shipping.carrier || 'Correo'} · Tracking: <span className="font-mono">{order.shipping.trackingNumber}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

