import { ProductTypesService } from './product-types.service';
export declare class ProductTypesController {
    private readonly service;
    constructor(service: ProductTypesService);
    findAll(categoryId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        category: {
            name: string;
        };
    } & {
        name: string;
        id: string;
        category_id: string;
    })[]>;
}
