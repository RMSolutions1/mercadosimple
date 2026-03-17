'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, Truck, Package, ChevronRight, Wallet, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useWalletStore } from '@/store/wallet.store';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Order } from '@/types';

const STEPS = ['Envío', 'Pago', 'Confirmación'];
const PROVINCES = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta', 'Misiones', 'Corrientes', 'Chaco', 'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro', 'Neuquén', 'Formosa', 'Chubut', 'San Luis', 'Catamarca', 'La Rioja', 'La Pampa', 'Santa Cruz', 'Tierra del Fuego', 'Ciudad de Buenos Aires'];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { wallet, fetchWallet } = useWalletStore();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const [shippingForm, setShippingForm] = useState({
    name: '', address: '', city: '', province: 'Buenos Aires', zipCode: '', phone: '', floor: '', instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [installments, setInstallments] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const subtotal = cart ? Number(cart.total) : 0;
      const res = await api.post('/orders/validate-coupon', {
        code: couponCode.toUpperCase(),
        subtotal,
      });
      const { discount, label } = res.data;
      setCouponDiscount(discount);
      setCouponApplied(true);
      toast.success(`✅ Cupón aplicado: ${label}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cupón inválido o expirado');
      setCouponApplied(false);
      setCouponDiscount(0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const [pagoSimplePlans, setPagoSimplePlans] = useState<any[]>([]);

  const INSTALLMENTS_OPTIONS = pagoSimplePlans.length > 0 ? pagoSimplePlans.map(p => ({
    qty: p.qty,
    label: p.label,
    surcharge: p.surcharge,
    installmentAmount: p.installmentAmount,
    totalAmount: p.totalAmount,
  })) : [
    { qty: 1, label: '1 cuota sin interés', surcharge: 0 },
    { qty: 3, label: '3 cuotas sin interés', surcharge: 0 },
    { qty: 6, label: '6 cuotas +15%', surcharge: 0.15 },
  ];

  const selectedInstallment = INSTALLMENTS_OPTIONS.find((o) => o.qty === installments) || INSTALLMENTS_OPTIONS[0];

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    fetchCart();
    fetchWallet();
    if (user) {
      setShippingForm((f) => ({
        ...f,
        name: user.name || '',
        address: user.address || '',
        city: user.city || '',
        province: user.province || 'Buenos Aires',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (cart?.total && Number(cart.total) > 0) {
      api.get(`/pago-simple/installments/${Number(cart.total)}`).then(({ data }) => {
        if (data.plans?.length > 0) setPagoSimplePlans(data.plans);
      }).catch(() => { /* silent */ });
    }
  }, [cart?.total]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, address, city, zipCode, phone } = shippingForm;
    if (!name || !address || !city || !zipCode || !phone) { toast.error('Completá todos los campos'); return; }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) { toast.error('El carrito está vacío'); return; }
    if (paymentMethod === 'wallet') {
      const walletBalance = Number(wallet?.balance || 0);
      if (walletBalance < Number(cart.total)) {
        toast.error(`Saldo insuficiente. Tenés $${walletBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}, necesitás $${Number(cart.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
        return;
      }
    }
    setIsLoading(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: shippingForm, paymentMethod });
      setOrder(data);
      setStep(2);
      fetchCart(); // Actualizar carrito (ya vaciado en backend)
      if (paymentMethod === 'wallet') fetchWallet(); // Actualizar balance
      toast.success('¡Pedido confirmado!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Error al procesar el pedido');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Agregá productos antes de finalizar la compra</p>
        <Link href="/productos" className="btn-primary">Ver productos</Link>
      </div>
    );
  }

  const walletBalance = Number(wallet?.balance || 0);
  const cartTotal = Number(cart?.total || 0);
  const finalTotal = cart ? cartTotal * (1 + (selectedInstallment?.surcharge || 0)) - couponDiscount : 0;
  const walletInsufficient = paymentMethod === 'wallet' && walletBalance < finalTotal;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((stepName, i) => (
          <div key={stepName} className="flex items-center">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-ms-blue' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                i < step ? 'bg-ms-blue border-ms-blue text-white' : i === step ? 'border-ms-blue text-ms-blue bg-white' : 'border-gray-300 text-gray-400 bg-white'
              }`}>
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{stepName}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-12 sm:w-24 h-0.5 mx-2 ${i < step ? 'bg-ms-blue' : 'bg-gray-300'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-ms-blue" /> Dirección de envío
              </h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo *</label>
                    <input type="text" value={shippingForm.name} onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })} required className="input-field" placeholder="Juan Pérez" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección *</label>
                    <input type="text" value={shippingForm.address} onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })} required className="input-field" placeholder="Av. Corrientes 1234, Piso 3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad *</label>
                    <input type="text" value={shippingForm.city} onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })} required className="input-field" placeholder="Buenos Aires" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Provincia</label>
                    <select value={shippingForm.province} onChange={(e) => setShippingForm({ ...shippingForm, province: e.target.value })} className="input-field">
                      {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Código postal *</label>
                    <input type="text" value={shippingForm.zipCode} onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })} required className="input-field" placeholder="1001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono *</label>
                    <input type="tel" value={shippingForm.phone} onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })} required className="input-field" placeholder="+54 11 1234-5678" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Piso / Dpto.</label>
                    <input type="text" value={shippingForm.floor} onChange={(e) => setShippingForm({ ...shippingForm, floor: e.target.value })} className="input-field" placeholder="Ej: Piso 3, Dpto B" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Instrucciones de entrega</label>
                    <textarea value={shippingForm.instructions} onChange={(e) => setShippingForm({ ...shippingForm, instructions: e.target.value })} className="input-field resize-none" rows={2} placeholder="Ej: Dejar con el portero, tocar timbre 2 veces..." />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-3 mt-2 flex items-center justify-center gap-2 font-semibold">
                  Continuar al pago <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-ms-blue" /> Método de pago
              </h2>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'wallet', label: 'Pago Simple — Mi billetera', icon: '💳', desc: `Saldo disponible: $${walletBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, highlight: true },
                  { value: 'credit_card', label: 'Tarjeta de crédito', icon: '💳', desc: 'Visa, Mastercard, American Express' },
                  { value: 'debit_card', label: 'Tarjeta de débito', icon: '💳', desc: 'Débito bancario inmediato' },
                  { value: 'bank_transfer', label: 'Transferencia bancaria', icon: '🏦', desc: 'CBU / CVU' },
                  { value: 'mercado_pago', label: 'Mercado Pago', icon: '🔵', desc: 'Pagar con cuenta Mercado Pago' },
                  { value: 'cash', label: 'Efectivo', icon: '💵', desc: 'Pago contra entrega' },
                ].map((method) => (
                  <label key={method.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.value ? 'border-ms-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  } ${method.highlight ? 'ring-1 ring-ms-blue/20' : ''}`}>
                    <input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                        {method.highlight && <span className="text-xs bg-ms-blue text-white px-1.5 py-0.5 rounded">Recomendado</span>}
                      </div>
                      <p className={`text-xs ${method.value === 'wallet' && walletInsufficient ? 'text-red-500' : 'text-gray-500'}`}>{method.desc}</p>
                    </div>
                    {paymentMethod === method.value && <CheckCircle className="w-5 h-5 text-ms-blue flex-shrink-0" />}
                  </label>
                ))}
              </div>

              {paymentMethod === 'wallet' && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FFF4)', border: '1px solid #BAE6FD' }}>
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">Potenciado por Pago Simple</span>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan de pago (con billetera)</label>
                  <div className="space-y-2">
                    {INSTALLMENTS_OPTIONS.map((opt) => {
                      const totalForPlan = Number(cart?.total || 0) * (1 + opt.surcharge);
                      return (
                        <label key={opt.qty} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${installments === opt.qty ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="installments" value={opt.qty} checked={installments === opt.qty} onChange={() => setInstallments(opt.qty)} className="sr-only" />
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${installments === opt.qty ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">{opt.qty === 1 ? formatPrice(totalForPlan) : `${opt.qty}x ${formatPrice(totalForPlan / opt.qty)}`}</div>
                            {opt.surcharge > 0 && <div className="text-xs text-gray-400">Total: {formatPrice(totalForPlan)}</div>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de cuotas</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ms-blue"
                  >
                    {INSTALLMENTS_OPTIONS.map((opt) => (
                      <option key={opt.qty} value={opt.qty}>
                        {opt.label} — {formatPrice((cart?.total || 0) * (1 + opt.surcharge) / opt.qty)}/mes
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Datos de la tarjeta</p>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    placeholder="Nombre tal como aparece en la tarjeta"
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })}
                    placeholder="1234 5678 9012 3456"
                    className="input-field text-sm font-mono"
                    maxLength={19}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCardData({ ...cardData, expiry: v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v });
                      }}
                      placeholder="MM/AA"
                      className="input-field text-sm"
                      maxLength={5}
                    />
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="CVV"
                      className="input-field text-sm"
                      maxLength={4}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && walletInsufficient && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-red-700">Saldo insuficiente</p>
                    <p className="text-xs text-red-600">Necesitás ${(Number(cart.total) - walletBalance).toLocaleString('es-AR', { minimumFractionDigits: 2 })} más.</p>
                    <Link href="/billetera" className="text-xs text-ms-blue underline">Cargar saldo →</Link>
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && !walletInsufficient && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700">Se descontarán <span className="font-bold">${Number(cart.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span> de tu billetera</p>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm text-blue-800">
                  <p className="font-semibold mb-2">Datos para transferir:</p>
                  <p>CBU: <span className="font-mono font-bold">0000049800000000012345</span></p>
                  <p>Alias: <span className="font-bold">MERCADO.SIMPLE.AR</span></p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 btn-secondary py-3 font-semibold">Volver</button>
                <button onClick={handlePlaceOrder} disabled={isLoading || walletInsufficient} className="flex-1 btn-green py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Pagar {formatPrice(cartTotal)}</>}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && order && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h2>
              <p className="text-gray-500 mb-2">Tu pedido fue procesado correctamente</p>
              <p className="text-sm font-mono bg-gray-100 px-4 py-2 rounded-lg inline-block mb-6 text-gray-700">#{order.orderNumber}</p>
              {order.shipping?.trackingNumber && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-ms-blue mb-1">Número de seguimiento</p>
                  <p className="font-mono text-sm text-gray-700">{order.shipping.trackingNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">Transportista: {order.shipping.carrier}</p>
                  {order.shipping.estimatedDelivery && (
                    <p className="text-xs text-gray-500">Entrega estimada: {new Date(order.shipping.estimatedDelivery).toLocaleDateString('es-AR')}</p>
                  )}
                </div>
              )}
              {order.payment?.method === 'wallet' && (
                <div className="bg-green-50 rounded-lg p-3 mb-6 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700">Pagado con Pago Simple ✓</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/perfil/pedidos" className="btn-primary px-6 py-2.5">Ver mis pedidos</Link>
                <Link href="/productos" className="btn-secondary px-6 py-2.5">Seguir comprando</Link>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={item.product?.images?.[0] || 'https://placehold.co/48'} alt={item.product?.title} className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">{item.product?.title}</p>
                    <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-medium text-gray-900 flex-shrink-0">{formatPrice(Number(item.product?.price || 0) * item.quantity)}</p>
                </div>
              ))}
            </div>
            {/* CUPÓN */}
            {!couponApplied && (
              <div className="my-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="¿Tenés un cupón?"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ms-blue"
                  />
                  <button onClick={applyCoupon} disabled={isValidatingCoupon} className="bg-ms-blue text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                    {isValidatingCoupon ? '...' : 'Aplicar'}
                  </button>
                </div>
              </div>
            )}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span className={cart.shippingCost === 0 ? 'text-ms-green font-medium' : ''}>{cart.shippingCost === 0 ? '¡Gratis!' : formatPrice(cart.shippingCost)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Descuento cupón</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {selectedInstallment && selectedInstallment.surcharge > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Financiación ({installments} cuotas)</span>
                  <span>+{formatPrice(cartTotal * Number(selectedInstallment.surcharge))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(Math.max(0, finalTotal))}</span>
              </div>
              {installments > 1 && (
                <p className="text-xs text-gray-500 text-right">{installments}x {formatPrice(Math.max(0, finalTotal) / installments)} por mes</p>
              )}
            </div>
            {step === 1 && paymentMethod === 'wallet' && (
              <div className={`mt-3 p-2 rounded-lg text-xs text-center ${walletInsufficient ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                Saldo billetera: {formatPrice(walletBalance)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
