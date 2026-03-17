import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoSimpleService } from './pago-simple.service';
import { PagoSimpleController } from './pago-simple.controller';
import { PaymentLink } from './entities/payment-link.entity';
import { Settlement } from './entities/settlement.entity';
import { QrPayment } from './entities/qr-payment.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentLink,
      Settlement,
      QrPayment,
      Wallet,
      WalletTransaction,
      User,
    ]),
  ],
  providers: [PagoSimpleService],
  controllers: [PagoSimpleController],
  exports: [PagoSimpleService],
})
export class PagoSimpleModule {}
