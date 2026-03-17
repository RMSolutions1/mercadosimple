'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MessageCircle, Settings, Star } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, getReputationLabel } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        province: user.province || '',
      });
    }
  }, [isAuthenticated, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.put('/users/me', form);
      updateUser(data);
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar nav */}
        <div className="space-y-2">
          {[
            { href: '/perfil', icon: User, label: 'Mi cuenta', active: true },
            { href: '/perfil/pedidos', icon: Package, label: 'Mis pedidos' },
            { href: '/perfil/favoritos', icon: Heart, label: 'Favoritos' },
            { href: '/chat', icon: MessageCircle, label: 'Mensajes' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.active ? 'bg-ms-blue text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
          {(user.role === 'seller' || user.role === 'admin') && (
            <Link href="/vendedor/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">Panel Vendedor</span>
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-ms-blue text-white flex items-center justify-center text-3xl font-bold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'seller' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : user.role === 'seller' ? 'Vendedor' : 'Comprador'}
                  </span>
                  {Number(user.reputation) > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {Number(user.reputation).toFixed(1)} - {getReputationLabel(Number(user.reputation))}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Miembro desde {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Teléfono', value: user.phone || '-' },
                    { label: 'Ciudad', value: user.city || '-' },
                    { label: 'Provincia', value: user.province || '-' },
                    { label: 'Dirección', value: user.address || '-' },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-xs text-gray-500 mb-0.5">{field.label}</p>
                      <p className="text-sm text-gray-900">{field.value}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm py-2 px-4">
                  Editar perfil
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+54 11..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Provincia</label>
                    <input type="text" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary text-sm py-2 px-4">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="btn-primary text-sm py-2 px-4">
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
