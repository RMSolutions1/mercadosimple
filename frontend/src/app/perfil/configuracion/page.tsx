'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings, Bell, Eye, Globe, Moon, Shield, Trash2, ArrowLeft,
  Mail, Smartphone, Volume2, Star, Package, MessageCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const SETTINGS_KEY = 'ms_user_settings';

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  orderUpdates: true,
  promotions: false,
  messages: true,
  reviews: true,
  language: 'es-AR',
  currency: 'ARS',
};

export default function ConfiguracionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login?returnUrl=' + encodeURIComponent('/perfil/configuracion')); return; }
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }); } catch { /* ignore */ }
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const toggle = (key: keyof typeof DEFAULT_SETTINGS) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
    toast.success('Configuración actualizada');
  };

  const changeSelect = (key: 'language' | 'currency', value: string) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
    toast.success('Configuración actualizada');
  };

  type SettingBoolKey = 'emailNotifications' | 'pushNotifications' | 'smsNotifications' | 'orderUpdates' | 'promotions' | 'messages' | 'reviews';

  const NotifRow = ({ icon: Icon, label, desc, settingKey, color }: { icon: any; label: string; desc?: string; settingKey: SettingBoolKey; color: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          {desc && <p className="text-gray-500 text-xs">{desc}</p>}
        </div>
      </div>
      <button
        onClick={() => toggle(settingKey)}
        className={`w-11 h-6 rounded-full relative transition-colors ${settings[settingKey] ? 'bg-ms-blue' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[settingKey] ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/perfil" className="p-2 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-500 text-sm">Personalizá tu experiencia</p>
          </div>
        </div>

        {/* NOTIFICACIONES */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-ms-blue" /> Canales de notificación
          </h2>
          <NotifRow icon={Mail} label="Email" desc="Recibir notificaciones por email" settingKey="emailNotifications" color="bg-blue-100 text-blue-600" />
          <NotifRow icon={Smartphone} label="Push" desc="Notificaciones en el navegador" settingKey="pushNotifications" color="bg-purple-100 text-purple-600" />
          <NotifRow icon={Volume2} label="SMS" desc="Mensajes de texto al celular" settingKey="smsNotifications" color="bg-green-100 text-green-600" />
        </div>

        {/* TIPOS DE NOTIFICACIÓN */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-ms-blue" /> Tipos de notificaciones
          </h2>
          <NotifRow icon={Package} label="Mis pedidos" desc="Estado de compras y envíos" settingKey="orderUpdates" color="bg-orange-100 text-orange-600" />
          <NotifRow icon={MessageCircle} label="Mensajes" desc="Nuevos mensajes de vendedores" settingKey="messages" color="bg-green-100 text-green-600" />
          <NotifRow icon={Star} label="Calificaciones" desc="Cuando alguien califica tu venta" settingKey="reviews" color="bg-yellow-100 text-yellow-600" />
          <NotifRow icon={Bell} label="Promociones" desc="Ofertas y descuentos especiales" settingKey="promotions" color="bg-red-100 text-red-600" />
        </div>

        {/* PREFERENCIAS */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-ms-blue" /> Idioma y moneda
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Idioma</label>
              <select value={settings.language} onChange={(e) => changeSelect('language', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="es-AR">Español (Argentina)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Moneda</label>
              <select value={settings.currency} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" disabled>
                <option value="ARS">ARS (Pesos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PELIGRO */}
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <h2 className="font-bold text-red-600 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Zona de peligro
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 text-sm">Desactivar cuenta</p>
                <p className="text-gray-500 text-xs">Podés volver a activarla cuando quieras</p>
              </div>
              <button className="text-sm text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition font-semibold">
                Desactivar
              </button>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="font-medium text-red-700 text-sm">Eliminar cuenta</p>
                <p className="text-gray-500 text-xs">Esta acción es irreversible</p>
              </div>
              <button className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-semibold flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
