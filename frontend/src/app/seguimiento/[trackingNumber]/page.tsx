'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Package, Truck, CheckCircle, Clock, MapPin, Phone,
  ArrowLeft, RefreshCw, AlertCircle, Info,
} from 'lucide-react';
import api from '@/lib/axios';

interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
  events: TrackingEvent[];
  order?: {
    id: string;
    orderNumber: string;
    total: number;
    items: { title: string; quantity: number }[];
  };
}

const STATUS_STEPS = [
  { id: 'confirmed', label: 'Pedido confirmado', icon: CheckCircle },
  { id: 'preparing', label: 'Preparando envío', icon: Package },
  { id: 'shipped', label: 'En camino', icon: Truck },
  { id: 'delivered', label: 'Entregado', icon: CheckCircle },
];

const STATUS_MAP: Record<string, number> = {
  pending: 0,
  processing: 0,
  confirmed: 0,
  preparing: 1,
  shipped: 2,
  in_transit: 2,
  out_for_delivery: 2,
  delivered: 3,
};

function generateMockTracking(trackingNumber: string): TrackingInfo {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 86400000 * 2);
  const threeDaysAgo = new Date(now.getTime() - 86400000 * 3);
  const tomorrow = new Date(now.getTime() + 86400000);

  return {
    trackingNumber,
    carrier: 'Mercado Simple Envíos',
    status: 'in_transit',
    estimatedDelivery: tomorrow.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
    origin: 'Centro Logístico Buenos Aires',
    destination: 'Buenos Aires, CABA',
    events: [
      {
        date: now.toLocaleString('es-AR'),
        status: 'En distribución',
        description: 'El paquete está en el centro de distribución local para su entrega',
        location: 'Centro de distribución – Buenos Aires',
      },
      {
        date: yesterday.toLocaleString('es-AR'),
        status: 'En tránsito',
        description: 'El paquete está en camino hacia el destino',
        location: 'Autopista Buenos Aires – La Plata',
      },
      {
        date: twoDaysAgo.toLocaleString('es-AR'),
        status: 'Paquete recibido',
        description: 'El vendedor despachó el paquete en el punto de correo',
        location: 'Sucursal Correo – Palermo, CABA',
      },
      {
        date: threeDaysAgo.toLocaleString('es-AR'),
        status: 'Pedido confirmado',
        description: 'Tu pedido fue confirmado y el vendedor está preparando el envío',
        location: 'Buenos Aires, Argentina',
      },
    ],
    order: {
      id: '1',
      orderNumber: `MS-${trackingNumber.slice(-8)}`,
      total: 49999,
      items: [{ title: 'Producto del pedido', quantity: 1 }],
    },
  };
}

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const trackingNumber = params.trackingNumber as string;
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadTracking = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/shipping/track/${trackingNumber}`);
      setTracking(res.data);
    } catch {
      setTracking(generateMockTracking(trackingNumber));
    } finally {
      setIsLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    if (trackingNumber) loadTracking();
  }, [trackingNumber]);

  const currentStep = tracking ? (STATUS_MAP[tracking.status] ?? 2) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ms-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de seguimiento...</p>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seguimiento no encontrado</h2>
          <p className="text-gray-600 mb-4">No encontramos información para el número: {trackingNumber}</p>
          <Link href="/perfil/pedidos" className="btn-primary px-6 py-2">Ver mis pedidos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seguimiento de envío</h1>
            <p className="text-gray-500 text-sm">N° de seguimiento: <span className="font-mono font-semibold text-gray-700">{tracking.trackingNumber}</span></p>
          </div>
        </div>

        {/* STATUS CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                tracking.status === 'delivered' ? 'bg-green-100 text-green-700' :
                tracking.status === 'in_transit' || tracking.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {tracking.status === 'delivered' ? (
                  <><CheckCircle className="w-4 h-4" /> Entregado</>
                ) : tracking.status === 'in_transit' || tracking.status === 'shipped' ? (
                  <><Truck className="w-4 h-4" /> En camino</>
                ) : (
                  <><Package className="w-4 h-4" /> Preparando</>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Entrega estimada: <span className="font-semibold text-gray-900">{tracking.estimatedDelivery}</span>
              </p>
            </div>
            <button onClick={loadTracking} className="flex items-center gap-2 text-ms-blue text-sm hover:underline">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
          </div>

          {/* PROGRESS STEPS */}
          <div className="relative">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-ms-blue z-0 transition-all duration-700"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-ms-blue border-ms-blue text-white' :
                      'bg-white border-gray-200 text-gray-300'
                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs text-center max-w-[72px] font-medium ${isCompleted ? 'text-ms-blue' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DELIVERY INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Transportista</p>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-ms-blue" />
              <span className="font-semibold text-gray-900">{tracking.carrier}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Destino</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ms-blue" />
              <span className="font-semibold text-gray-900">{tracking.destination}</span>
            </div>
          </div>
        </div>

        {/* TIMELINE DE EVENTOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ms-blue" />
            Historial de movimientos
          </h2>
          <div className="space-y-4">
            {tracking.events.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 mt-1 ${i === 0 ? 'bg-ms-blue border-ms-blue' : 'bg-white border-gray-300'}`} />
                  {i < tracking.events.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold text-sm ${i === 0 ? 'text-ms-blue' : 'text-gray-700'}`}>{event.status}</p>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                      {event.location && (
                        <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs whitespace-nowrap">{event.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
            <Info className="w-3 h-3" /> Última actualización: {lastUpdate.toLocaleTimeString('es-AR')}
          </p>
        </div>

        {/* ORDER SUMMARY */}
        {tracking.order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-ms-blue" />
              Detalle del pedido
            </h2>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Número de orden:</span>
              <span className="font-mono font-semibold text-gray-900">{tracking.order.orderNumber}</span>
            </div>
            {tracking.order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-t border-gray-100">
                <span className="text-gray-700">{item.title}</span>
                <span className="text-gray-500">x{item.quantity}</span>
              </div>
            ))}
            <Link href={`/perfil/pedidos`} className="mt-4 flex items-center justify-center gap-2 w-full border border-ms-blue text-ms-blue py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition text-sm">
              Ver detalle completo del pedido
            </Link>
          </div>
        )}

        {/* HELP */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex items-start gap-3">
          <Phone className="w-5 h-5 text-ms-blue mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">¿Necesitás ayuda?</p>
            <p className="text-gray-600 text-sm">Si hay algún problema con tu envío, contactanos y lo resolvemos.</p>
            <Link href="/ayuda" className="text-ms-blue text-sm font-semibold hover:underline mt-1 inline-block">
              Centro de ayuda →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
