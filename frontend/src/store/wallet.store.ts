import { create } from 'zustand';
import api from '@/lib/axios';
import { Wallet, WalletTransaction, WalletTransactionsResponse } from '@/types';
import toast from 'react-hot-toast';

interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  total: number;
  totalPages: number;
  isLoading: boolean;

  fetchWallet: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<WalletTransactionsResponse | null>;
  deposit: (amount: number, description?: string, paymentMethod?: string) => Promise<boolean>;
  withdraw: (amount: number, bankAccountCbu?: string, description?: string) => Promise<boolean>;
  transfer: (recipientEmail: string, amount: number, description?: string) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  transactions: [],
  total: 0,
  totalPages: 0,
  isLoading: false,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/wallet');
      set({ wallet: data });
    } catch {
      // silencioso si no hay auth
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<WalletTransactionsResponse>(`/wallet/transactions?page=${page}`);
      set({
        transactions: data.transactions,
        total: data.total,
        totalPages: data.totalPages,
        // Preserve full wallet data including cvu/alias
        wallet: data.wallet
          ? { ...get().wallet!, balance: data.wallet.balance, ...(data.wallet as any) }
          : get().wallet,
      });
      return data;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deposit: async (amount, description?, paymentMethod?) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/wallet/deposit', { amount, description, paymentMethod });
      set((state) => ({
        wallet: state.wallet ? { ...state.wallet, balance: data.newBalance } : state.wallet,
      }));
      toast.success(`¡Saldo cargado! +$${Number(amount).toLocaleString('es-AR')}`);
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al cargar saldo';
      toast.error(msg);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  withdraw: async (amount, bankAccountCbu?, description?) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/wallet/withdraw', { amount, bankAccountCbu, description });
      set((state) => ({
        wallet: state.wallet ? { ...state.wallet, balance: data.newBalance } : state.wallet,
      }));
      toast.success(`Retiro solicitado. Llegarás a tu cuenta en 1-2 días hábiles`);
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al retirar saldo';
      toast.error(msg);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  transfer: async (recipientEmail, amount, description?) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/wallet/transfer', { recipientEmail, amount, description });
      set((state) => ({
        wallet: state.wallet ? { ...state.wallet, balance: data.newBalance } : state.wallet,
      }));
      toast.success(data.message || 'Transferencia realizada');
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al transferir';
      toast.error(msg);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshBalance: async () => {
    try {
      const { data } = await api.get('/wallet');
      set({ wallet: data });
    } catch {}
  },
}));
