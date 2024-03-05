import { Module } from '@nestjs/common';
import { UserController } from '@app/user/user.controller';
import { UserService } from '@app/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Module({
    controllers: [UserController],
    providers: [UserService, AuthGuard],
    exports: [UserService],
    imports: [TypeOrmModule.forFeature([UserEntity])],
  },
)

export class UserModule {
}