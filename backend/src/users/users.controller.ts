import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users/me — get own profile */
  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  /** GET /users/me/notifications — get user rejection messages */
  @Get('me/notifications')
  getNotifications(@Request() req: any) {
    return this.usersService.getNotifications(req.user.id);
  }

  /** GET /users/:id — get any user's public profile */
  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  /** PATCH /users/me — update own profile */
  @Patch('me')
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  /** POST /users/password — update password */
  @Post('password')
  updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(
      req.user.id,
      dto.old_password,
      dto.new_password,
    );
  }
}
