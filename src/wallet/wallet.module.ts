import { Module } from '@nestjs/common';
import { WalletController } from '@app/wallet/wallet.controller';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { WalletService } from '@app/wallet/wallet.service';

@Module({
  controllers: [WalletController],
  providers: [AuthGuard,WalletService],

})

export class WalletModule {
}