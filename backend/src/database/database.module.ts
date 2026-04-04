import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Shipping } from '../shipping/entities/shipping.entity';
import { Review } from '../reviews/entities/review.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { TransferReceipt } from '../wallet/entities/transfer-receipt.entity';
import { Question } from '../questions/entities/question.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { PaymentLink } from '../pago-simple/entities/payment-link.entity';
import { QrPayment } from '../pago-simple/entities/qr-payment.entity';
import { Settlement } from '../pago-simple/entities/settlement.entity';

/** Evita URLs rotas tipo postgres:// sin host → pg intenta socket Unix y falla con ENOENT //:@//.s.PGSQL.5432 */
function getSafeDatabaseUrl(raw: string | undefined): string | undefined {
  const url = raw?.trim();
  if (!url) return undefined;
  if (!/^postgres(ql)?:\/\//i.test(url)) return undefined;
  try {
    const asHttp = url.replace(/^postgres(ql)?:\/\//i, 'http://');
    const u = new URL(asHttp);
    if (!u.hostname || u.hostname.length < 1) return undefined;
    return url;
  } catch {
    return undefined;
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const rawUrl = configService.get<string>('DATABASE_URL');
        const databaseUrl = getSafeDatabaseUrl(rawUrl);
        if (rawUrl?.trim() && !databaseUrl) {
          // eslint-disable-next-line no-console
          console.error(
            '[DatabaseModule] DATABASE_URL está definida pero es inválida (sin host o formato incorrecto). ' +
              'Usando DB_HOST / DB_* o corregí el secret en Fly: fly secrets set DATABASE_URL="postgresql://..."',
          );
        }
        const allowSync = configService.get('ALLOW_SYNC') === 'true';
        const base = {
          entities: [
            User,
            Product,
            Category,
            CartItem,
            Order,
            OrderItem,
            Payment,
            Shipping,
            Review,
            Favorite,
            Conversation,
            Message,
            Wallet,
            WalletTransaction,
            TransferReceipt,
            Question,
            Notification,
            PaymentLink,
            QrPayment,
            Settlement,
          ],
          synchronize: configService.get('NODE_ENV') !== 'production' || allowSync,
          logging: configService.get('NODE_ENV') === 'development',
        };
        if (databaseUrl) {
          return {
            ...base,
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
          } as const;
        }
        return {
          ...base,
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: parseInt(configService.get('DB_PORT', '5432')),
          username: configService.get('DB_USERNAME', 'mercadosimple'),
          password: configService.get('DB_PASSWORD', 'mercadosimple123'),
          database: configService.get('DB_DATABASE', 'mercadosimple'),
          ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
