import { PrismaService } from '../prisma/prisma.service';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    myPurchases(buyerId: string): Promise<({
        product: {
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
    })[]>;
    findOne(id: string, buyerId: string): Promise<{
        product: {
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
    }>;
    create(buyerId: string, productId: string): Promise<{
        product: {
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
    }>;
    remove(id: string, buyerId: string): Promise<{
        message: string;
    }>;
    mySales(sellerId: string): Promise<({
        product: {
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
    })[]>;
    addReview(id: string, buyerId: string, comment: string, rating?: number): Promise<{
        id: string;
        created_at: Date;
        product_id: string;
        status: string;
        buyer_id: string;
        payment_id: string | null;
        is_test: boolean;
        buyer_comment: string | null;
        buyer_rating: number | null;
    }>;
}
