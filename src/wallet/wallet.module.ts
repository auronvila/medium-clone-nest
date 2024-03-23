import { Module } from '@nestjs/common';
import { WalletController } from '@app/wallet/wallet.controller';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { WalletService } from '@app/wallet/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { WalletEntity } from '@app/wallet/wallet.entity';

@Module({
  controllers: [WalletController],
  providers: [AuthGuard, WalletService],
  imports: [TypeOrmModule.forFeature([UserEntity, WalletEntity])],
})

export class WalletModule {
}