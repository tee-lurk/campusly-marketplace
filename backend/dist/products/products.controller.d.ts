import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
    }[]>;
    myListings(req: any): Promise<{
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
    }[]>;
    findOne(req: any, id: string): Promise<{
        has_deliverable: boolean;
        has_purchased: boolean;
        purchased_at: Date | null;
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
    downloadFile(req: any, id: string): Promise<{
        deliverable_file_url: string | null;
    }>;
    create(req: any, dto: CreateProductDto): Promise<{
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
    }>;
    toggleHide(req: any, id: string): Promise<{
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
    update(req: any, id: string, dto: UpdateProductDto): Promise<{
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
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
