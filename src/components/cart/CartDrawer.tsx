'use client';

import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCartStore();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-ms-blue text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="font-bold text-lg">Mi Carrito</h2>
            {cart && cart.itemsCount > 0 && (
              <span className="bg-ms-yellow text-gray-900 text-xs font-bold rounded-full px-2 py-0.5">
                {cart.itemsCount}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="hover:bg-blue-700 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400 mt-1">Agrega productos para comenzar</p>
              <Link
                href="/productos"
                onClick={closeCart}
                className="mt-6 btn-primary"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  {/* Image */}
                  <div className="w-16 h-16 bg-white rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/64'}
                      alt={item.product?.title}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2 leading-tight">{item.product?.title}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {formatPrice(Number(item.product?.price || 0))}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) removeItem(item.id);
                          else updateItem(item.id, item.quantity - 1);
                        }}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span className={cart.shippingCost === 0 ? 'text-ms-green font-medium' : ''}>
                  {cart.shippingCost === 0 ? '¡Gratis!' : formatPrice(cart.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center btn-green py-3 text-base font-semibold rounded-lg"
            >
              Finalizar compra
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2 py-1"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
