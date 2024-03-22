import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';

@Entity({ name: 'wallets' })
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  publicKey: string;

  @Column()
  privateKey: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}