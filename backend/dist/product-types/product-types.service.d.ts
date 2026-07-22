import { PrismaService } from '../prisma/prisma.service';
export declare class ProductTypesService {
    private prisma;
    constructor(prisma: PrismaService);
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
