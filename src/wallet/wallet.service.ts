import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WalletEntity } from '@app/wallet/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import Web3 from 'web3';
import * as process from 'process';

const infuraEndpoint = `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`;

const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
  ) {
  }

  async getWalletByUserId(userId: string): Promise<{ publicKey: string }> {
    const walletData = await this.walletRepository.findOne({ where: { user: { id: userId } } });
    if (walletData) {
      return { publicKey: walletData.publicKey };
    } else {
      return null;
    }
  }

  async generateWalletForUser(userId: string): Promise<WalletEntity> {
    const walletData = await this.getWalletByUserId(userId);
    if (walletData && walletData.publicKey !== null) {
      throw new HttpException('This account already has a wallet', HttpStatus.FORBIDDEN);
    }

    const newAccount = web3.eth.accounts.create();
    const address = newAccount.address;
    const privateKey = newAccount.privateKey;

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

}

