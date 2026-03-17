import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { TransferReceipt } from '../wallet/entities/transfer-receipt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Order, Payment, Wallet, WalletTransaction, TransferReceipt])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
