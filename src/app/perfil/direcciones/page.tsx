'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, Edit2, Trash2, ArrowLeft, CheckCircle, Home, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'ms_addresses';

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  floor?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export default function DireccionesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', street: '', number: '', floor: '', city: '', province: '', postalCode: '', type: 'home' as const });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login?returnUrl=' + encodeURIComponent('/perfil/direcciones')); return; }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setAddresses(JSON.parse(stored)); } catch { /* ignore */ }
    } else if (user?.address) {
      const initial: Address[] = [{
        id: '1',
        label: 'Mi casa',
        street: user.address || '',
        number: '',
        city: user.city || '',
        province: user.province || '',
        postalCode: '',
        isDefault: true,
        type: 'home',
      }];
      setAddresses(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, [isAuthenticated, user]);

  const persist = (updated: Address[]) => {
    setAddresses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const def = updated.find((a) => a.isDefault);
    if (def) {
      api.put('/users/me', {
        address: `${def.street} ${def.number}`.trim(),
        city: def.city,
        province: def.province,
      }).catch(() => null);
    }
  };

  const handleSave = () => {
    if (!form.street || !form.city || !form.province) { toast.error('Completá los campos obligatorios'); return; }
    let updated: Address[];
    if (editingId) {
      updated = addresses.map((a) => a.id === editingId ? { ...a, ...form } : a);
      toast.success('Dirección actualizada');
    } else {
      const isFirst = addresses.length === 0;
      updated = [...addresses, { ...form, id: Date.now().toString(), isDefault: isFirst }];
      toast.success('Dirección agregada');
    }
    persist(updated);
    setShowForm(false);
    setEditingId(null);
    setForm({ label: '', street: '', number: '', floor: '', city: '', province: '', postalCode: '', type: 'home' });
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    persist(updated);
    toast.success('Dirección eliminada');
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    persist(updated);
    toast.success('Dirección predeterminada actualizada');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/perfil" className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis direcciones</h1>
              <p className="text-gray-500 text-sm">Guardá tus direcciones de entrega</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="flex items-center gap-2 bg-ms-blue text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sin direcciones guardadas</h3>
            <p className="text-gray-500 mb-4">Agregá una dirección para agilizar tus compras</p>
            <button onClick={() => setShowForm(true)} className="bg-ms-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">
              Agregar primera dirección
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={`bg-white rounded-xl border p-4 ${addr.isDefault ? 'border-ms-blue' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${addr.type === 'home' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {addr.type === 'home' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{addr.label || 'Mi dirección'}</p>
                      {addr.isDefault && (
                        <span className="text-xs bg-ms-blue text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {addr.street} {addr.number}{addr.floor ? `, ${addr.floor}` : ''}
                    </p>
                    <p className="text-gray-500 text-sm">{addr.city}, {addr.province} {addr.postalCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingId(addr.id); setForm(addr as any); setShowForm(true); }}
                      className="p-1.5 text-gray-400 hover:text-ms-blue transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="mt-2 text-xs text-ms-blue hover:underline">
                    Establecer como predeterminada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">{editingId ? 'Editar dirección' : 'Nueva dirección'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Etiqueta (opcional)</label>
                  <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Ej: Casa, Trabajo" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue">
                    <option value="home">Casa</option>
                    <option value="work">Trabajo</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Calle *</label>
                  <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Av. Corrientes" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Número *</label>
                  <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="1234" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Piso/Depto (opcional)</label>
                <input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="Ej: 3° B" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad *</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Provincia *</label>
                  <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Código postal</label>
                  <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="1234" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition text-sm">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 bg-ms-blue text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
