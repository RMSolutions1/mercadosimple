export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'buyer';
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  reputation: number;
  totalSales: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  originalPriceDisplay?: number;
  discountPercent?: number;
  stock: number;
  images: string[];
  status: 'active' | 'paused' | 'sold' | 'deleted';
  condition: 'new' | 'used' | 'refurbished';
  freeShipping: boolean;
  rating: number;
  reviewCount?: number;
  salesCount?: number;
  viewsCount?: number;
  brand?: string;
  model?: string;
  attributes?: Record<string, any>;
  seller: User;
  sellerId?: string;
  category: Category;
  reviews?: Review[];
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  helpfulCount?: number;
  user?: User;
  product?: Product;
  createdAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  itemsCount: number;
}

export interface OrderItem {
  id: string;
  productTitle: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
    phone: string;
  };
  items: OrderItem[];
  payment?: Payment;
  shipping?: Shipping;
  buyer?: User;
  createdAt: string;
}

export interface Payment {
  id: string;
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'mercado_pago' | 'wallet';
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  amount: number;
  transactionId?: string;
  createdAt: string;
}

export interface Shipping {
  id: string;
  carrier?: string;
  trackingNumber?: string;
  status: 'pending' | 'preparing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
  cost: number;
  estimatedDelivery?: string;
  deliveredAt?: string;
}

export interface Favorite {
  id: string;
  product: Product;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  sender: User;
  createdAt: string;
}

export interface Conversation {
  id: string;
  buyer: User;
  seller: User;
  product?: Product;
  messages?: Message[];
  lastMessage?: Message;
  unreadCount: number;
  lastMessageAt?: string;
  createdAt: string;
}

// Billetera Virtual
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  isFrozen?: boolean;
  frozenReason?: string;
  frozenBalance?: number;
  // Identidad bancaria PSP
  cvu?: string;
  alias?: string;
  accountNumber?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export type WalletTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'refund'
  | 'transfer_in'
  | 'transfer_out'
  | 'cashback';

export type WalletTransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WalletTransactionsResponse {
  wallet: { balance: number; currency: string };
  transactions: WalletTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface Question {
  id: string;
  productId: string;
  askerId: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  status: 'unanswered' | 'answered' | 'deleted';
  isPublic: boolean;
  asker?: { name: string };
  answerer?: { name: string };
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}
