import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseSeedsModule } from '../database/database-seeds.module';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { TransferReceipt } from '../wallet/entities/transfer-receipt.entity';
import { Category } from '../categories/entities/category.entity';
import { Review } from '../reviews/entities/review.entity';
import { Question } from '../questions/entities/question.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Product,
      Order,
      Payment,
      Wallet,
      WalletTransaction,
      TransferReceipt,
      Category,
      Review,
      Question,
      Conversation,
      Message,
    ]),
    DatabaseSeedsModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
