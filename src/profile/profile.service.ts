import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from '@app/types/profileResponse.interface';
import { ProfileType } from '@app/types/profile.type';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
  ) {
  }

  async buildProfileResponse(profile: ProfileType): Promise<ProfileResponseInterface> {
    delete profile.email;
    return { profile: profile };
  }

  async getProfile(username: string, currentUserId: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username: username } });

    if (!user) {
      throw new HttpException('User with this username was not found', HttpStatus.NOT_FOUND);
    }

    let following = false;

    if (currentUserId) {
      const follow = await this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: user.id },
      });

      following = !!follow;
    }

    return { ...user, following: following };
  }

  async getUserWithUsername(username: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { username: username } });
  }


  async followProfile(username: string, currentUserId: string): Promise<ProfileType> {
    const user = await this.getUserWithUsername(username);

    if (!user) {
      throw new HttpException('user with this username was not found', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException('follower and following cant be equal', HttpStatus.BAD_REQUEST);
    }

    const follow = await this.followRepository.findOne({ where: { followerId: currentUserId, followingId: user.id } });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followingId = user.id;
      followToCreate.followerId = currentUserId;
      await this.followRepository.save(followToCreate);
    }

    return { ...user, following: true };
  }

  async unfollowProfile(username: string, currentUserId: string): Promise<ProfileType> {
    const user = await this.getUserWithUsername(username);

    if (!user) {
      throw new HttpException('user with this username was not found', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException('follower and following cant be equal', HttpStatus.BAD_REQUEST);
    }

    const follow = await this.followRepository.findOne({ where: { followerId: currentUserId, followingId: user.id } });

    if (follow) {
      await this.followRepository.remove(follow);
    }

    return { ...user, following: false };
  }
}