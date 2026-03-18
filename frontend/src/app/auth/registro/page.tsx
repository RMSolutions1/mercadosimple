'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ShoppingCart, Store, CheckCircle, Shield, Zap, ChevronRight, CreditCard, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  {
    value: 'buyer',
    icon: ShoppingCart,
    title: 'Quiero comprar',
    desc: 'Accedé a millones de productos con envío a todo el país',
    benefits: ['Compra Protegida garantizada', 'Cuotas sin interés', 'Seguimiento en tiempo real'],
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    activeBorder: '#3B82F6',
  },
  {
    value: 'seller',
    icon: Store,
    title: 'Quiero vender',
    desc: 'Publicá tus productos y llegá a miles de compradores',
    benefits: ['Panel de vendedor completo', 'Gestión de envíos integrada', 'Cobro seguro garantizado'],
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    activeBorder: '#10B981',
  },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Al menos 8 caracteres', ok: password.length >= 8 },
    { label: 'Contiene número', ok: /\d/.test(password) },
    { label: 'Contiene mayúscula', ok: /[A-Z]/.test(password) },
  ];
  const strength = checks.filter(c => c.ok).length;
  const colors = ['#EF4444', '#F59E0B', '#10B981'];
  const labels = ['Débil', 'Regular', 'Fuerte'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < strength ? colors[strength - 1] : '#E5E7EB' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: strength > 0 ? colors[strength - 1] : '#9CA3AF' }}>
          {strength > 0 ? labels[strength - 1] : ''}
        </span>
        <div className="flex gap-3">
          {checks.map(c => (
            <span key={c.label} className={`text-[10px] flex items-center gap-0.5 ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="w-2.5 h-2.5" /> {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'buyer';
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1); // 1: role, 2: data
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    phone: '',
    acceptTerms: false,
  });

  const selectedRole = ROLE_OPTIONS.find(r => r.value === form.role)!;
  const RoleIcon = selectedRole.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.acceptTerms) { toast.error('Debés aceptar los términos y condiciones'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
    if (form.password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return; }
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('¡Cuenta creada! Bienvenido.');
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
        return;
      }
      if (form.role === 'seller') router.push('/vendedor/dashboard');
      else router.push('/mi-cuenta');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      const text = Array.isArray(msg) ? msg[0] : msg;
      toast.error(text || error.message || 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 40%, #1E40AF 70%, #2563EB 100%)' }}>
      {/* Left panel - Branding Pago Simple */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/5 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link href="/pago-simple" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#93C5FD]" />
            </div>
            <div>
              <span className="font-black text-white text-xl tracking-tight block">Pago Simple</span>
              <span className="text-blue-200/80 text-xs">por Mercado Simple</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight">
              Creá tu cuenta y empezá a pagar y cobrar en minutos
            </h1>
            <p className="text-blue-100/90 text-lg mt-4 leading-relaxed">
              Billetera digital, pago de servicios, recargas, prepagas y más. Sin costo de apertura.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Shield, text: 'Datos cifrados y Compra Protegida' },
              { icon: CreditCard, text: 'Pago de servicios, recargas y prepagas' },
              { icon: Smartphone, text: 'Links y QR para cobrar al instante' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-300" />
                </div>
                <p className="text-white/80 text-sm">{text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-2">
            {[
              { value: 'Sin costo', label: 'Crear cuenta' },
              { value: '3.5%', label: 'Por transacción' },
              { value: '24/7', label: 'Disponible' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-blue-200">{stat.value}</p>
                <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/30 text-xs">
          © 2026 Pago Simple · Mercado Simple
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <span className="font-black text-white text-lg block">Pago Simple</span>
              <span className="text-blue-200/80 text-xs">por Mercado Simple</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-2xl font-black text-gray-900">Crear cuenta en Pago Simple</h2>
              <p className="text-gray-500 text-sm mt-1">Sin costo, sin tarjeta. Empezá a pagar y cobrar en 2 minutos.</p>
              <div className="flex items-center gap-2 mt-4">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>{s}</div>
                    {s < 2 && <div className={`w-8 h-0.5 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                  </div>
                ))}
                <span className="text-xs text-gray-400 ml-2">{step === 1 ? 'Elegí tu perfil' : 'Tus datos'}</span>
              </div>
            </div>

            <div className="px-8 pb-8">
              {/* Step 1: Role selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">¿Cómo vas a usar Pago Simple?</p>
                  <div className="space-y-3">
                    {ROLE_OPTIONS.map(option => {
                      const Icon = option.icon;
                      const selected = form.role === option.value;
                      return (
                        <button key={option.value} type="button"
                          onClick={() => setForm(p => ({ ...p, role: option.value }))}
                          className="w-full text-left rounded-2xl border-2 p-4 transition-all duration-200"
                          style={{
                            borderColor: selected ? option.activeBorder : '#E5E7EB',
                            background: selected ? option.bg : 'white',
                          }}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selected ? option.color : '#F3F4F6' }}>
                              <Icon className="w-5 h-5" style={{ color: selected ? 'white' : '#9CA3AF' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-gray-900">{option.title}</p>
                                {selected && <CheckCircle className="w-5 h-5" style={{ color: option.color }} />}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                              {selected && (
                                <ul className="mt-2 space-y-1">
                                  {option.benefits.map(b => (
                                    <li key={b} className="text-xs flex items-center gap-1.5" style={{ color: option.color }}>
                                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                      {b}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setStep(2)}
                    className="w-full py-3.5 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                    Continuar <ChevronRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    ¿Ya tenés cuenta?{' '}
                    <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">Ingresá</Link>
                  </p>
                </div>
              )}

              {/* Step 2: Data form */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Selected role pill */}
                  <div className="flex items-center gap-2 mb-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      ← Cambiar
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: selectedRole.bg, color: selectedRole.color }}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      {selectedRole.title}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required placeholder="Juan Pérez"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      required placeholder="juan@email.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono (opcional)</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+54 11 1234 5678"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        required minLength={8} placeholder="Mínimo 8 caracteres"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all pr-11" />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        required placeholder="Repetir contraseña"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all pr-11" />
                      <button type="button" onClick={() => setShowConfirm(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Las contraseñas no coinciden
                      </p>
                    )}
                    {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 8 && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Contraseñas coinciden
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      form.acceptTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                    }`} onClick={() => setForm(p => ({ ...p, acceptTerms: !p.acceptTerms }))}>
                      {form.acceptTerms && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-gray-600 leading-relaxed">
                      Acepto los{' '}
                      <Link href="/terminos" className="text-blue-600 hover:underline font-medium">Términos y condiciones</Link>
                      {' '}y la{' '}
                      <Link href="/privacidad" className="text-blue-600 hover:underline font-medium">Política de privacidad</Link>
                      {' '}de Pago Simple / Mercado Simple
                    </span>
                  </label>

                  <button type="submit" disabled={isLoading || !form.acceptTerms}
                    className="w-full py-3.5 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Crear mi cuenta gratis <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">o</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <p className="text-center text-sm text-gray-500">
                    ¿Ya tenés cuenta?{' '}
                    <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">Ingresá</Link>
                  </p>
                </form>
              )}
            </div>

            <Link href="/pago-simple" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4 pb-2">
              ← Volver a Pago Simple
            </Link>

            {/* Footer trust indicators */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-6">
              {[
                { icon: Shield, text: 'Datos cifrados' },
                { icon: CheckCircle, text: '100% gratuito' },
                { icon: Zap, text: 'Acceso inmediato' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon className="w-3.5 h-3.5 text-green-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #0F172A, #2563EB)' }}>
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
