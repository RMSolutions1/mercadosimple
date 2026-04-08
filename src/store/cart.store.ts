import { create } from 'zustand';
import { Cart, CartItem } from '@/types';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart');
      set({ cart: data });
    } catch (error) {
      // not authenticated
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      await api.post('/cart/add', { productId, quantity });
      await get().fetchCart();
      toast.success('Producto agregado al carrito');
      set({ isOpen: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar al carrito');
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await get().fetchCart();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ cart: null });
    } catch (error) {}
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
