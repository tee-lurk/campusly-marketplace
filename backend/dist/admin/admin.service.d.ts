import { PrismaService } from '../prisma/prisma.service';
import { ReviewProductDto } from './dto/review-product.dto';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingQueue(): Promise<({
        category: {
            name: string;
            id: string;
        };
        productType: {
            name: string;
            id: string;
            category_id: string;
        };
        images: {
            id: string;
            product_id: string;
            image_url: string;
        }[];
        seller: {
            profile: {
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
            } | null;
            id: string;
        };
    } & {
        id: string;
        created_at: Date;
        user_id: string;
        title: string;
        description: string;
        price: number;
        category_id: string;
        product_type_id: string;
        deliverable_file_url: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        is_featured: boolean;
        report_count: number;
    })[]>;
    reviewProduct(adminId: string, productId: string, dto: ReviewProductDto): Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        title: string;
        description: string;
        price: number;
        category_id: string;
        product_type_id: string;
        deliverable_file_url: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        is_featured: boolean;
        report_count: number;
    }>;
    getAllListings(): Promise<({
        category: {
            name: string;
            id: string;
        };
        productType: {
            name: string;
            id: string;
            category_id: string;
        };
        images: {
            id: string;
            product_id: string;
            image_url: string;
        }[];
        seller: {
            profile: {
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
            } | null;
            id: string;
        };
    } & {
        id: string;
        created_at: Date;
        user_id: string;
        title: string;
        description: string;
        price: number;
        category_id: string;
        product_type_id: string;
        deliverable_file_url: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        is_featured: boolean;
        report_count: number;
    })[]>;
    removeListing(productId: string): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        totalListings: number;
        activeUsers: number;
        pendingReview: number;
        totalTransactions: number;
    }>;
    getVerifications(): Promise<({
        user: {
            email: string;
            id: string;
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
    })[]>;
    reviewVerification(adminId: string, userId: string, dto: {
        action: 'approve' | 'reject' | 'revoke';
        reason?: string;
    }): Promise<{
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
}
