import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WalletEntity } from '@app/wallet/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { WalletReqDto } from '@app/wallet/dto/wallet-req.dto';
import { WithdrawRes } from '@app/wallet/withdrawRes';
import * as dotenv from 'dotenv';

dotenv.config();
const infuraEndpoint = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;

@Injectable()
export class WalletService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
  ) {
    this.provider = new ethers.JsonRpcProvider(infuraEndpoint);
  }

  async getWalletByUserId(userId: string): Promise<{ publicKey: string }> {
    const walletData = await this.walletRepository.findOne({ where: { user: { id: userId } } });
    if (walletData) {
      return { publicKey: walletData.publicKey };
    } else {
      throw new HttpException('This account do not have a wallet', HttpStatus.FORBIDDEN);
    }
  }

  async generateWalletForUser(userId: string): Promise<WalletEntity> {
    const walletData = await this.getWalletByUserId(userId);
    if (walletData && walletData.publicKey !== null) {
      throw new HttpException('This account already has a wallet', HttpStatus.FORBIDDEN);
    }

    const newAccount = ethers.Wallet.createRandom();
    const privateKey = newAccount.privateKey;
    const address = await newAccount.getAddress();

    const wallet = new WalletEntity();
    wallet.publicKey = address;
    wallet.privateKey = privateKey;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    user.wallet = wallet;
    user.publicKey = address;

    await this.walletRepository.save(wallet);
    await this.userRepository.save(user);

    delete wallet.id;
    return wallet;
  }

  async withDraw(userId: string, withdrawReqData: WalletReqDto): Promise<WithdrawRes> {
    const senderWallet = await this.walletRepository.findOne({ where: { user: { id: userId } } });
    const sendersPrivateKey = senderWallet.privateKey;
    const wallet = new ethers.Wallet(sendersPrivateKey, this.provider);
    try {
      const tx = await wallet.sendTransaction({
        to: withdrawReqData.to,
        value: ethers.parseEther(withdrawReqData.amount),
      });
      await tx.wait();
      const resDto = {
        txHash: tx.hash,
      };
      return resDto;
    } catch (e) {
      throw new HttpException(e, HttpStatus.FORBIDDEN);
    }
  }
}
