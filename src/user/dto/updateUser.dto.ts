import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  readonly email: string;

  readonly username: string;

  readonly bio: string;

  readonly image: string;
}