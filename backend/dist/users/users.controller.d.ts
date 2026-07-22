import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
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
    getProfile(id: string): Promise<{
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
    updateMe(req: any, dto: UpdateProfileDto): Promise<{
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
    updatePassword(req: any, dto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
}
