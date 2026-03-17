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

const ALL_ENTITIES = [
  User, Product, Category, CartItem, Order, OrderItem,
  Payment, Shipping, Review, Favorite, Conversation, Message,
  Wallet, WalletTransaction, TransferReceipt,
  Question, Notification,
  PaymentLink, QrPayment, Settlement,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'mercadosimple',
      password: process.env.DB_PASSWORD || 'mercadosimple123',
      database: process.env.DB_DATABASE || 'mercadosimple',
      entities: ALL_ENTITIES,
      synchronize: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([
      User, Product, Category, Review, Wallet, WalletTransaction,
      Question, Notification,
    ]),
  ],
  providers: [SeedService],
})
class SeedModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn'],
  });
  const seedService = app.get(SeedService);

  try {
    await seedService.run();
    console.log('\n✅ Seeds ejecutados correctamente');
  } catch (error) {
    console.error('\n❌ Error al ejecutar seeds:', error.message || error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
