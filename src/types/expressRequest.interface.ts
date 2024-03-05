import { Request } from 'express';
import { UserEntity } from '@app/user/user.entity';

export interface ExpressRequest extends Request {
  user?: UserEntity;
}

export interface UserResponse {
  user: {
    id: string,
    username: string,
    email: string,
    bio: string,
    image: string
  };
}