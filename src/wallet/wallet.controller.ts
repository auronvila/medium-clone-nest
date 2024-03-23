import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { WalletService } from '@app/wallet/wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {
  }

  @Get()
  @UseGuards(AuthGuard)
  async getByUserId(@User('id') userId: string) {
    return this.walletService.getWalletByUserId(userId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async generateWallet(@User('id') userId: string) {
    return this.walletService.generateWalletForUser(userId);
  }
}