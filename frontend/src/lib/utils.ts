import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number | string | undefined | null): string {
  const n = Number(price ?? 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n);
}

export function formatPriceUSD(price: number | string | undefined | null): string {
  const n = Number(price ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n);
}

export function getDiscount(original: number | string, current: number | string): number {
  const o = Number(original);
  const c = Number(current);
  if (!o || o <= c) return 0;
  return Math.round(((o - c) / o) * 100);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
  return `Hace ${Math.floor(days / 365)} años`;
}

export function getReputationLabel(rep: number | string): string {
  const r = Number(rep);
  if (r >= 4.5) return 'Excelente';
  if (r >= 4.0) return 'Muy bueno';
  if (r >= 3.5) return 'Bueno';
  if (r >= 3.0) return 'Regular';
  return 'Nuevo';
}

export function getReputationColor(rep: number | string): string {
  const r = Number(rep);
  if (r >= 4.5) return 'text-green-600';
  if (r >= 4.0) return 'text-blue-600';
  if (r >= 3.5) return 'text-yellow-600';
  if (r >= 3.0) return 'text-orange-600';
  return 'text-gray-600';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
    active: 'Activo',
    paused: 'Pausado',
    sold: 'Vendido',
    preparing: 'Preparando',
    in_transit: 'En tránsito',
    out_for_delivery: 'En reparto',
    returned: 'Devuelto',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    approved: 'bg-green-100 text-green-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
