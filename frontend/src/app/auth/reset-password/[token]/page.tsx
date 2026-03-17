'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Contraseña actualizada correctamente');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Token inválido o expirado');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
          <p className="text-gray-600 mb-4">Tu contraseña fue cambiada exitosamente. Redirigiendo al login...</p>
          <Link href="/auth/login" className="btn-primary">Ir al login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-ms-blue">
            mercado<span className="text-ms-yellow bg-ms-blue px-1 rounded">simple</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Nueva contraseña</h1>
          <p className="text-gray-500 text-sm">Ingresá tu nueva contraseña</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="input-field pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí la contraseña"
              className="input-field"
              required
            />
          </div>
          {/* Password strength */}
          {password && (
            <div className="space-y-1">
              {[
                { ok: password.length >= 8, label: 'Mínimo 8 caracteres' },
                { ok: /[A-Z]/.test(password), label: 'Una mayúscula' },
                { ok: /[0-9]/.test(password), label: 'Un número' },
              ].map((req) => (
                <p key={req.label} className={`text-xs flex gap-1 ${req.ok ? 'text-green-600' : 'text-gray-400'}`}>
                  {req.ok ? '✓' : '○'} {req.label}
                </p>
              ))}
            </div>
          )}
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/auth/login" className="text-ms-blue hover:underline">← Volver al login</Link>
        </p>
      </div>
    </div>
  );
}
