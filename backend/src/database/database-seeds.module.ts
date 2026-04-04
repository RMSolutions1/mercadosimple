import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seeds/seed.service';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category]), WalletModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseSeedsModule {}
