import { Injectable } from '@nestjs/common';
import { WalletEntity } from '@app/wallet/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
  ) {
  }

  async getWalletByUserId(userId: string) {
    return 'walletttt';
  }

  async generateWalletForUser(userId: string): Promise<WalletEntity> {
    // Generate wallet addresses
    // const publicKey = generatePublicKey(); // Implement your logic to generate public key
    // const privateKey = generatePrivateKey(); // Implement your logic to generate private key

    // Create a new Wallet entity
    const wallet = new WalletEntity();
    // wallet.publicKey = publicKey;
    // wallet.privateKey = privateKey;

    // Find user by userId
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Assign wallet to user
    user.wallet = wallet;

    // Save user and wallet
    await this.userRepository.save(user);

    return wallet;
  }
}