import { IsNotEmpty, IsString, Validate } from 'class-validator';

export class WalletReqDto {
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  amount: string;
}
