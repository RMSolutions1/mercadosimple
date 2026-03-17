-- ============================================================
--  MERCADO SIMPLE — Migración inicial (producción)
--  Ejecutar UNA SOLA VEZ al desplegar en producción
--  Orden: respeta dependencias de foreign keys
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- búsqueda de texto

-- ── ENUM TYPES ────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('admin','seller','buyer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_verification_enum AS ENUM ('unverified','pending','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status_enum AS ENUM ('pending','processing','paid','shipped','delivered','cancelled','refunded','disputed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('pending','approved','rejected','cancelled','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM ('credit_card','debit_card','wallet','bank_transfer','cash','mercadopago');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shipping_status_enum AS ENUM ('pending','preparing','shipped','in_transit','delivered','returned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_tx_type_enum AS ENUM ('deposit','withdrawal','transfer_in','transfer_out','payment','refund','fee','adjustment','qr_payment','link_payment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_tx_status_enum AS ENUM ('pending','completed','failed','reversed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE receipt_type_enum AS ENUM ('transfer','deposit','withdrawal','payment','refund','qr_payment','link_payment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE receipt_status_enum AS ENUM ('completed','reversed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_link_status_enum AS ENUM ('active','paid','expired','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_link_type_enum AS ENUM ('single','reusable','subscription');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE qr_payment_status_enum AS ENUM ('pending','paid','expired','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE settlement_status_enum AS ENUM ('pending','available','transferred','held');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── TABLAS ────────────────────────────────────────────────────────────────

-- users
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'buyer',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "verificationStatus" user_verification_enum NOT NULL DEFAULT 'unverified',
  avatar VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  province VARCHAR,
  "zipCode" VARCHAR,
  bio TEXT,
  "businessName" VARCHAR,
  "businessDescription" TEXT,
  reputation DECIMAL(3,1) DEFAULT 5.0,
  "totalSales" INTEGER DEFAULT 0,
  "totalReviews" INTEGER DEFAULT 0,
  "adminNotes" TEXT,
  "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  "blockedReason" VARCHAR,
  "resetPasswordToken" VARCHAR,
  "resetPasswordExpires" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- categories
CREATE TABLE IF NOT EXISTS "category" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR,
  image VARCHAR,
  "parentId" UUID REFERENCES "category"(id),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- products
CREATE TABLE IF NOT EXISTS "product" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  "originalPrice" DECIMAL(12,2),
  stock INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]',
  condition VARCHAR NOT NULL DEFAULT 'new',
  brand VARCHAR,
  model VARCHAR,
  specifications JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  "sellerId" UUID NOT NULL REFERENCES "user"(id),
  "categoryId" UUID NOT NULL REFERENCES "category"(id),
  status VARCHAR NOT NULL DEFAULT 'active',
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  rating DECIMAL(3,1) DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "salesCount" INTEGER DEFAULT 0,
  "viewCount" INTEGER DEFAULT 0,
  "freeShipping" BOOLEAN DEFAULT false,
  "shippingCost" DECIMAL(10,2) DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_seller ON "product"("sellerId");
CREATE INDEX IF NOT EXISTS idx_product_category ON "product"("categoryId");
CREATE INDEX IF NOT EXISTS idx_product_status ON "product"(status);
CREATE INDEX IF NOT EXISTS idx_product_title_trgm ON "product" USING gin(title gin_trgm_ops);

-- cart_item
CREATE TABLE IF NOT EXISTS "cart_item" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "product"(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- order
CREATE TABLE IF NOT EXISTS "order" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "buyerId" UUID NOT NULL REFERENCES "user"(id),
  status order_status_enum NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  "shippingCost" DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  "shippingAddress" JSONB,
  notes TEXT,
  "adminNote" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_buyer ON "order"("buyerId");
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);

-- order_item
CREATE TABLE IF NOT EXISTS "order_item" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "product"(id),
  "sellerId" UUID NOT NULL REFERENCES "user"(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  title VARCHAR NOT NULL,
  image VARCHAR,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- payment
CREATE TABLE IF NOT EXISTS "payment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID NOT NULL REFERENCES "order"(id),
  method payment_method_enum NOT NULL DEFAULT 'credit_card',
  status payment_status_enum NOT NULL DEFAULT 'pending',
  amount DECIMAL(12,2) NOT NULL,
  installments INTEGER DEFAULT 1,
  "transactionId" VARCHAR,
  "externalId" VARCHAR,
  metadata JSONB,
  "processedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- shipping
CREATE TABLE IF NOT EXISTS "shipping" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID NOT NULL REFERENCES "order"(id),
  status shipping_status_enum NOT NULL DEFAULT 'pending',
  carrier VARCHAR DEFAULT 'Correo Argentino',
  "trackingNumber" VARCHAR,
  "estimatedDelivery" TIMESTAMPTZ,
  "deliveredAt" TIMESTAMPTZ,
  address JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipping_tracking ON "shipping"("trackingNumber");

-- review
CREATE TABLE IF NOT EXISTS "review" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "reviewerId" UUID NOT NULL REFERENCES "user"(id),
  "sellerId" UUID NOT NULL REFERENCES "user"(id),
  "productId" UUID NOT NULL REFERENCES "product"(id),
  "orderId" UUID REFERENCES "order"(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- favorite
CREATE TABLE IF NOT EXISTS "favorite" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "product"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("userId","productId")
);

-- conversation
CREATE TABLE IF NOT EXISTS "conversation" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "buyerId" UUID NOT NULL REFERENCES "user"(id),
  "sellerId" UUID NOT NULL REFERENCES "user"(id),
  "productId" UUID REFERENCES "product"(id),
  "lastMessageAt" TIMESTAMPTZ DEFAULT now(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- message
CREATE TABLE IF NOT EXISTS "message" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "conversationId" UUID NOT NULL REFERENCES "conversation"(id) ON DELETE CASCADE,
  "senderId" UUID NOT NULL REFERENCES "user"(id),
  content TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_message_conversation ON "message"("conversationId");

-- wallet
CREATE TABLE IF NOT EXISTS "wallet" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  "frozenBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR NOT NULL DEFAULT 'ARS',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  cvu VARCHAR(22) UNIQUE,
  alias VARCHAR UNIQUE,
  "accountNumber" VARCHAR UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- wallet_transaction
CREATE TABLE IF NOT EXISTS "wallet_transaction" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "walletId" UUID NOT NULL REFERENCES "wallet"(id),
  type wallet_tx_type_enum NOT NULL,
  status wallet_tx_status_enum NOT NULL DEFAULT 'completed',
  amount DECIMAL(12,2) NOT NULL,
  "balanceBefore" DECIMAL(12,2),
  "balanceAfter" DECIMAL(12,2),
  description VARCHAR,
  reference VARCHAR,
  metadata JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON "wallet_transaction"("walletId");
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON "wallet_transaction"("createdAt" DESC);

-- transfer_receipts
CREATE TABLE IF NOT EXISTS "transfer_receipts" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "receiptNumber" VARCHAR NOT NULL UNIQUE,
  type receipt_type_enum NOT NULL,
  status receipt_status_enum NOT NULL DEFAULT 'completed',
  "senderId" UUID NOT NULL REFERENCES "user"(id),
  "senderCvu" VARCHAR,
  "senderAlias" VARCHAR,
  "senderAccountNumber" VARCHAR,
  "recipientId" UUID REFERENCES "user"(id),
  "recipientCvu" VARCHAR,
  "recipientAlias" VARCHAR,
  "recipientAccountNumber" VARCHAR,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR DEFAULT 'ARS',
  description VARCHAR,
  "senderBalanceBefore" DECIMAL(12,2),
  "senderBalanceAfter" DECIMAL(12,2),
  "senderTransactionId" UUID,
  "recipientTransactionId" UUID,
  metadata JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- question
CREATE TABLE IF NOT EXISTS "question" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "productId" UUID NOT NULL REFERENCES "product"(id) ON DELETE CASCADE,
  "askerId" UUID NOT NULL REFERENCES "user"(id),
  "sellerId" UUID NOT NULL REFERENCES "user"(id),
  content TEXT NOT NULL,
  answer TEXT,
  "answeredAt" TIMESTAMPTZ,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- notification
CREATE TABLE IF NOT EXISTS "notification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  data JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "notification"("userId");

-- payment_links (Pago Simple)
CREATE TABLE IF NOT EXISTS "payment_links" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR NOT NULL UNIQUE,
  "creatorId" UUID NOT NULL REFERENCES "user"(id),
  "payerId" UUID,
  title VARCHAR NOT NULL,
  description VARCHAR,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR DEFAULT 'ARS',
  status payment_link_status_enum NOT NULL DEFAULT 'active',
  type payment_link_type_enum NOT NULL DEFAULT 'single',
  "expiresAt" TIMESTAMPTZ,
  "paidAt" TIMESTAMPTZ,
  reference VARCHAR,
  "maxInstallments" INTEGER DEFAULT 0,
  metadata JSONB,
  "successRedirect" VARCHAR,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- qr_payments (Pago Simple)
CREATE TABLE IF NOT EXISTS "qr_payments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "merchantId" UUID NOT NULL REFERENCES "user"(id),
  "qrCode" VARCHAR NOT NULL UNIQUE,
  "qrImageBase64" TEXT,
  title VARCHAR NOT NULL,
  description VARCHAR,
  amount DECIMAL(12,2),
  "fixedAmount" BOOLEAN DEFAULT true,
  currency VARCHAR DEFAULT 'ARS',
  status qr_payment_status_enum NOT NULL DEFAULT 'pending',
  "productId" UUID REFERENCES "product"(id),
  "expiresAt" TIMESTAMPTZ,
  "paidAt" TIMESTAMPTZ,
  "payerId" UUID,
  "paymentAmount" DECIMAL(12,2),
  metadata JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- settlements (Pago Simple)
CREATE TABLE IF NOT EXISTS "settlements" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sellerId" UUID NOT NULL REFERENCES "user"(id),
  "orderId" UUID REFERENCES "order"(id),
  "grossAmount" DECIMAL(12,2) NOT NULL,
  "feeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "feePercentage" DECIMAL(5,2) DEFAULT 3.5,
  "netAmount" DECIMAL(12,2) NOT NULL,
  status settlement_status_enum NOT NULL DEFAULT 'pending',
  "scheduledDate" TIMESTAMPTZ,
  "settledAt" TIMESTAMPTZ,
  description VARCHAR,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_settlement_seller ON "settlements"("sellerId");

-- ── FIN MIGRACIÓN ─────────────────────────────────────────────────────────
