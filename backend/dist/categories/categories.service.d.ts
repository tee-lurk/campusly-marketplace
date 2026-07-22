import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
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
