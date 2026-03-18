'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Eye, EyeOff, Smartphone, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function SeguridadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  if (!isAuthenticated) { router.push('/auth/login?returnUrl=' + encodeURIComponent('/perfil/seguridad')); return null; }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
    if (form.newPassword.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return; }
    setIsLoading(true);
    try {
      await api.put('/users/me', { password: form.newPassword, currentPassword: form.currentPassword });
      toast.success('Contraseña actualizada correctamente');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: score, label: 'Débil', color: 'bg-red-500' };
    if (score === 2) return { level: score, label: 'Regular', color: 'bg-yellow-500' };
    if (score === 3) return { level: score, label: 'Buena', color: 'bg-blue-500' };
    return { level: score, label: 'Muy fuerte', color: 'bg-green-500' };
  };

  const strength = passwordStrength(form.newPassword);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/perfil" className="p-2 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seguridad de la cuenta</h1>
            <p className="text-gray-500 text-sm">Gestioná el acceso y la seguridad</p>
          </div>
        </div>

        {/* STATUS */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-gray-900">Tu cuenta está protegida</p>
            <p className="text-gray-600 text-sm">Email verificado · Contraseña segura</p>
          </div>
        </div>

        {/* CAMBIAR CONTRASEÑA */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-ms-blue" />
            <h2 className="font-bold text-gray-900">Cambiar contraseña</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  className="w-full pr-10 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ms-blue"
                  required
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full pr-10 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ms-blue"
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= strength.level ? strength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Seguridad: <span className="font-semibold">{strength.label}</span></p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-ms-blue ${
                  form.confirmPassword && form.confirmPassword !== form.newPassword ? 'border-red-300' : 'border-gray-200'
                }`}
                required
              />
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-ms-blue text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
              {isLoading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>

        {/* 2FA */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-ms-blue" />
              <div>
                <h2 className="font-bold text-gray-900">Verificación en dos pasos</h2>
                <p className="text-gray-500 text-sm">Añadí una capa extra de seguridad</p>
              </div>
            </div>
            <button className="text-ms-blue text-sm font-semibold border border-ms-blue px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
              Activar (próximamente)
            </button>
          </div>
        </div>

        {/* SESIONES */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-ms-blue" /> Actividad reciente
          </h2>
          <div className="space-y-3">
            {[
              { device: 'Chrome · Windows', location: 'Buenos Aires, Argentina', time: 'Ahora mismo', current: true },
              { device: 'Safari · iPhone', location: 'Buenos Aires, Argentina', time: 'Hace 2 horas', current: false },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{session.device}</p>
                  <p className="text-gray-500 text-xs">{session.location} · {session.time}</p>
                </div>
                {session.current ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Activa</span>
                ) : (
                  <button className="text-xs text-red-500 hover:underline">Cerrar</button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-3 text-sm text-red-500 font-semibold hover:underline">
            Cerrar todas las otras sesiones
          </button>
        </div>
      </div>
    </div>
  );
}
