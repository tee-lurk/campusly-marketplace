import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: ProductQueryDto): Promise<{
        has_deliverable: boolean;
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
    }[]>;
    findOne(id: string): Promise<{
        has_deliverable: boolean;
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
    create(userId: string, dto: CreateProductDto): Promise<{
        images: {
            id: string;
            product_id: string;
            image_url: string;
        }[];
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
    }>;
    update(userId: string, id: string, dto: UpdateProductDto): Promise<{
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
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    myListings(userId: string): Promise<{
        has_deliverable: boolean;
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
    }[]>;
    getDeliverableFile(userId: string, userRole: string, productId: string): Promise<{
        deliverable_file_url: string | null;
    }>;
}
