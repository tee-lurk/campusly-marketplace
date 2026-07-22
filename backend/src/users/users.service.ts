import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { user_id: userId },
      include: { user: { select: { email: true, role: true, created_at: true } } },
    });
    if (!profile) throw new NotFoundException('Profile not found.');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { user_id: userId },
      data: { ...dto },
    });
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found.');

    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      throw new BadRequestException('Incorrect current password.');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashed },
    });

    return { message: 'Password updated successfully.' };
  }

  async getNotifications(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [reviews, sales] = await Promise.all([
      this.prisma.productReview.findMany({
        where: {
          product: { user_id: userId },
          reviewed_at: { gte: sevenDaysAgo },
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              images: { take: 1 },
            },
          },
        },
        orderBy: { reviewed_at: 'desc' },
        take: 20,
      }),
      this.prisma.transaction.findMany({
        where: {
          product: { user_id: userId },
          status: 'completed',
          created_at: { gte: sevenDaysAgo },
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: { take: 1 },
            },
          },
          buyer: {
            select: {
              profile: {
                select: { username: true, avatar_url: true },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 20,
      }),
    ]);

    const notifications: any[] = [];

    for (const r of reviews) {
      notifications.push({
        id: `review-${r.id}`,
        type: r.status === 'rejected' ? 'rejection' : 'approval',
        product: r.product,
        reason: r.reason,
        timestamp: r.reviewed_at,
      });
    }

    for (const s of sales) {
      notifications.push({
        id: `sale-${s.id}`,
        type: 'sale',
        product: s.product,
        buyer: s.buyer,
        timestamp: s.created_at,
      });
    }

    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return notifications.slice(0, 30);
  }
}
