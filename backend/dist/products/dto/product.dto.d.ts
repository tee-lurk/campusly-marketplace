export declare class CreateProductDto {
    title: string;
    description: string;
    price: number;
    category_id: string;
    product_type_id: string;
    images?: string[];
    deliverable_file_url?: string;
}
export declare class UpdateProductDto {
    title?: string;
    description?: string;
    price?: number;
    images?: string[];
    deliverable_file_url?: string;
}
export declare class ProductQueryDto {
    category_id?: string;
    product_type_id?: string;
    status?: string;
    search?: string;
    seller_id?: string;
}
