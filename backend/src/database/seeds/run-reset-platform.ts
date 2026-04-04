/**
 * Vacía todas las tablas y deja solo administrador + categorías.
 * Uso (solo entornos controlados):
 *   CONFIRM_RESET=YES npm run db:reset-platform
 */
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Shipping } from '../../shipping/entities/shipping.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Conversation } from '../../chat/entities/conversation.entity';
import { Message } from '../../chat/entities/message.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { WalletTransaction } from '../../wallet/entities/wallet-transaction.entity';
import { TransferReceipt } from '../../wallet/entities/transfer-receipt.entity';
import { Question } from '../../questions/entities/question.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { PaymentLink } from '../../pago-simple/entities/payment-link.entity';
import { QrPayment } from '../../pago-simple/entities/qr-payment.entity';
import { Settlement } from '../../pago-simple/entities/settlement.entity';
import { SeedService } from './seed.service';
import { WalletModule } from '../../wallet/wallet.module';

const ALL_ENTITIES = [
  User, Product, Category, CartItem, Order, OrderItem,
  Payment, Shipping, Review, Favorite, Conversation, Message,
  Wallet, WalletTransaction, TransferReceipt,
  Question, Notification,
  PaymentLink, QrPayment, Settlement,
];

function typeOrmConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  const base = { entities: ALL_ENTITIES, synchronize: true };
  if (databaseUrl) {
    return { type: 'postgres' as const, url: databaseUrl, ssl: { rejectUnauthorized: false }, ...base };
  }
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'mercadosimple',
    password: process.env.DB_PASSWORD || 'mercadosimple123',
    database: process.env.DB_DATABASE || 'mercadosimple',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    ...base,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    TypeOrmModule.forFeature([User, Category]),
    WalletModule,
  ],
  providers: [SeedService],
})
class ResetModule {}

async function bootstrap() {
  if (process.env.CONFIRM_RESET !== 'YES') {
    console.error('Abortado: definí CONFIRM_RESET=YES para ejecutar el reinicio total.');
    process.exit(1);
  }
  const app = await NestFactory.createApplicationContext(ResetModule, { logger: ['error', 'warn', 'log'] });
  const seedService = app.get(SeedService);
  try {
    await seedService.resetPlatformAndBootstrap('ELIMINAR_TODO_Y_REINICIAR');
    console.log('\n✅ Plataforma reiniciada (admin + categorías).');
  } catch (e: any) {
    console.error('\n❌ Error:', e?.message || e);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
