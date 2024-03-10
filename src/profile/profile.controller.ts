import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from '@app/profile/profile.service';
import { User } from '@app/user/decorators/user.decorator';
import { ProfileResponseInterface } from '@app/types/profileResponse.interface';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {
  }

  @Get(':username')
  async getProfile(@User('id') currentUserId: string, @Param('username') username: string): Promise<ProfileResponseInterface> {
    const userProfile = await this.profileService.getProfile(username, currentUserId);
    return this.profileService.buildProfileResponse(userProfile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(@User('id') currentUserId: string, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {
    const userProfile = await this.profileService.followProfile(profileUsername, currentUserId);
    return this.profileService.buildProfileResponse(userProfile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(@User('id') currentUserId: string, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {
    const userProfile = await this.profileService.unfollowProfile(profileUsername, currentUserId);
    return this.profileService.buildProfileResponse(userProfile);
  }
}