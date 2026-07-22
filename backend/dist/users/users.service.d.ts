import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            email: string;
            role: import("@prisma/client").$Enums.Role;
            created_at: Date;
        };
    } & {
        name: string;
        username: string;
        id: string;
        user_id: string;
        bio: string | null;
        avatar_url: string | null;
        is_verified: boolean;
        phone: string | null;
        student_id: string | null;
        student_id_card_url: string | null;
        verification_status: string;
        verification_reason: string | null;
        notify_email: boolean;
        notify_push: boolean;
        notify_sms: boolean;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        name: string;
        username: string;
        id: string;
        user_id: string;
        bio: string | null;
        avatar_url: string | null;
        is_verified: boolean;
        phone: string | null;
        student_id: string | null;
        student_id_card_url: string | null;
        verification_status: string;
        verification_reason: string | null;
        notify_email: boolean;
        notify_push: boolean;
        notify_sms: boolean;
    }>;
    updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
