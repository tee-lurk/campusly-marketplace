import { PrismaService } from '../prisma/prisma.service';
import { ReviewProductDto } from './dto/review-product.dto';
import { BanUserDto } from './dto/ban-user.dto';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        totalListings: number;
        pendingCount: number;
        approvedCount: number;
        rejectedCount: number;
        totalUsers: number;
        completedTransactions: number;
        totalRevenue: number;
        avgReviewTimeHours: number;
        slaCompliancePct: number;
        totalReviewsCount: number;
        categoryBreakdown: {
            name: string;
            count: number;
        }[];
    }>;
    getTimeseries(range: '7d' | '30d'): Promise<{
        date: string;
        listingsCount: number;
        transactionsCount: number;
    }[]>;
    getRecentActivity(filter: string, limit: number): Promise<{
        id: string;
        type: "listing" | "transaction" | "report";
        description: string;
        timestamp: string;
        relatedId: string;
    }[]>;
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
        images: {
            id: string;
            product_id: string;
            image_url: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        user_id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        title: string;
        description: string;
        price: number;
        category_id: string;
        product_type_id: string;
        is_featured: boolean;
        is_hidden: boolean;
        report_count: number;
        deliverable_file_url: string | null;
    })[]>;
    reviewProduct(adminId: string, productId: string, dto: ReviewProductDto): Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        title: string;
        description: string;
        price: number;
        category_id: string;
        product_type_id: string;
        is_featured: boolean;
        is_hidden: boolean;
        report_count: number;
        deliverable_file_url: string | null;
    }>;
    getAllListings(search?: string, category?: string, page?: number, pageSize?: number): Promise<{
        data: ({
            category: {
                name: string;
                id: string;
            };
            productType: {
                name: string;
                id: string;
                category_id: string;
            };
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
            images: {
                id: string;
                product_id: string;
                image_url: string;
            }[];
        } & {
            id: string;
            created_at: Date;
            user_id: string;
            status: import("@prisma/client").$Enums.ProductStatus;
            title: string;
            description: string;
            price: number;
            category_id: string;
            product_type_id: string;
            is_featured: boolean;
            is_hidden: boolean;
            report_count: number;
            deliverable_file_url: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    removeListing(productId: string): Promise<{
        message: string;
    }>;
    getUsers(search?: string, role?: string, page?: number, pageSize?: number): Promise<{
        data: {
            profile: {
                name: string;
                username: string;
                avatar_url: string | null;
                is_verified: boolean;
            } | null;
            email: string;
            id: string;
            role: import("@prisma/client").$Enums.Role;
            is_banned: boolean;
            banned_reason: string | null;
            banned_at: Date | null;
            created_at: Date;
            _count: {
                products: number;
            };
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getUserDetail(userId: string): Promise<{
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
        products: ({
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
        } & {
            id: string;
            created_at: Date;
            user_id: string;
            status: import("@prisma/client").$Enums.ProductStatus;
            title: string;
            description: string;
            price: number;
            category_id: string;
            product_type_id: string;
            is_featured: boolean;
            is_hidden: boolean;
            report_count: number;
            deliverable_file_url: string | null;
        })[];
        transactions: ({
            product: {
                seller: {
                    profile: {
                        name: string;
                        username: string;
                    } | null;
                    id: string;
                };
                images: {
                    id: string;
                    product_id: string;
                    image_url: string;
                }[];
            } & {
                id: string;
                created_at: Date;
                user_id: string;
                status: import("@prisma/client").$Enums.ProductStatus;
                title: string;
                description: string;
                price: number;
                category_id: string;
                product_type_id: string;
                is_featured: boolean;
                is_hidden: boolean;
                report_count: number;
                deliverable_file_url: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            product_id: string;
            status: string;
            buyer_id: string;
            payment_id: string | null;
            is_test: boolean;
            buyer_comment: string | null;
            buyer_rating: number | null;
        })[];
    } & {
        email: string;
        id: string;
        password_hash: string;
        role: import("@prisma/client").$Enums.Role;
        is_banned: boolean;
        banned_reason: string | null;
        banned_at: Date | null;
        created_at: Date;
    }>;
    banUser(adminId: string, userId: string, dto: BanUserDto): Promise<{
        email: string;
        id: string;
        is_banned: boolean;
        banned_reason: string | null;
        banned_at: Date | null;
    }>;
    unbanUser(userId: string): Promise<{
        email: string;
        id: string;
        is_banned: boolean;
    }>;
    getTransactions(search?: string, status?: string, page?: number, pageSize?: number): Promise<{
        data: ({
            product: {
                seller: {
                    profile: {
                        name: string;
                        username: string;
                        avatar_url: string | null;
                    } | null;
                    id: string;
                };
                images: {
                    id: string;
                    product_id: string;
                    image_url: string;
                }[];
            } & {
                id: string;
                created_at: Date;
                user_id: string;
                status: import("@prisma/client").$Enums.ProductStatus;
                title: string;
                description: string;
                price: number;
                category_id: string;
                product_type_id: string;
                is_featured: boolean;
                is_hidden: boolean;
                report_count: number;
                deliverable_file_url: string | null;
            };
            buyer: {
                profile: {
                    name: string;
                    username: string;
                    avatar_url: string | null;
                } | null;
                id: string;
            };
        } & {
            id: string;
            created_at: Date;
            product_id: string;
            status: string;
            buyer_id: string;
            payment_id: string | null;
            is_test: boolean;
            buyer_comment: string | null;
            buyer_rating: number | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
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
    getCategories(): Promise<({
        _count: {
            products: number;
        };
        productTypes: ({
            _count: {
                products: number;
            };
        } & {
            name: string;
            id: string;
            category_id: string;
        })[];
    } & {
        name: string;
        id: string;
    })[]>;
    createCategory(name: string): Promise<{
        name: string;
        id: string;
    }>;
    updateCategory(id: string, name: string): Promise<{
        name: string;
        id: string;
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
    getProductTypes(): Promise<({
        category: {
            name: string;
            id: string;
        };
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        category_id: string;
    })[]>;
    createProductType(name: string, categoryId: string): Promise<{
        category: {
            name: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        category_id: string;
    }>;
    updateProductType(id: string, name: string): Promise<{
        category: {
            name: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        category_id: string;
    }>;
    deleteProductType(id: string): Promise<{
        message: string;
    }>;
}
