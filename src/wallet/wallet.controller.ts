import { Body, Controller, Get, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { WalletService } from '@app/wallet/wallet.service';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { WalletReqDto } from '@app/wallet/dto/wallet-req.dto';

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

  @Post('/withdraw')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async withdraw(
    @User('id') userId: string,
    @Body() withdrawReqData: WalletReqDto,
  ) {
    return this.walletService.withDraw(userId, withdrawReqData);
  }
}