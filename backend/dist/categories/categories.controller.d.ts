import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly service;
    constructor(service: CategoriesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        productTypes: {
            name: string;
            id: string;
            category_id: string;
        }[];
    } & {
        name: string;
        id: string;
    })[]>;
}
