"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const products = await this.prisma.product.findMany({
            where: {
                status: query.status ?? 'approved',
                ...(query.category_id ? { category_id: query.category_id } : {}),
                ...(query.seller_id ? { user_id: query.seller_id } : {}),
                ...(query.product_type_id
                    ? { product_type_id: query.product_type_id }
                    : {}),
                ...(query.search
                    ? {
                        OR: [
                            { title: { contains: query.search, mode: 'insensitive' } },
                            { description: { contains: query.search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: {
                seller: { select: { id: true, profile: true } },
                category: true,
                productType: true,
                images: true,
            },
            orderBy: { created_at: 'desc' },
        });
        return products.map((p) => {
            const has_deliverable = !!p.deliverable_file_url;
            delete p.deliverable_file_url;
            return { ...p, has_deliverable };
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                seller: { select: { id: true, profile: true } },
                category: true,
                productType: true,
                images: true,
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        const has_deliverable = !!product.deliverable_file_url;
        delete product.deliverable_file_url;
        return { ...product, has_deliverable };
    }
    async create(userId, dto) {
        return this.prisma.product.create({
            data: {
                user_id: userId,
                title: dto.title,
                description: dto.description,
                price: dto.price,
                category_id: dto.category_id,
                product_type_id: dto.product_type_id,
                deliverable_file_url: dto.deliverable_file_url,
                status: 'pending',
                images: dto.images?.length
                    ? {
                        create: dto.images.map((url) => ({ image_url: url })),
                    }
                    : undefined,
            },
            include: { images: true },
        });
    }
    async update(userId, id, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        if (product.user_id !== userId)
            throw new common_1.ForbiddenException('You do not own this listing.');
        return this.prisma.product.update({
            where: { id },
            data: {
                ...(dto.title ? { title: dto.title } : {}),
                ...(dto.description ? { description: dto.description } : {}),
                ...(dto.price ? { price: dto.price } : {}),
                ...(dto.deliverable_file_url !== undefined
                    ? { deliverable_file_url: dto.deliverable_file_url }
                    : {}),
                status: 'pending',
                images: dto.images !== undefined
                    ? {
                        deleteMany: {},
                        create: dto.images.map((url) => ({ image_url: url })),
                    }
                    : undefined,
            },
        });
    }
    async remove(userId, id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        if (product.user_id !== userId)
            throw new common_1.ForbiddenException('You do not own this listing.');
        await this.prisma.product.delete({ where: { id } });
        return { message: 'Listing deleted.' };
    }
    async myListings(userId) {
        const products = await this.prisma.product.findMany({
            where: { user_id: userId },
            include: { images: true, category: true, productType: true },
            orderBy: { created_at: 'desc' },
        });
        return products.map((p) => {
            const has_deliverable = !!p.deliverable_file_url;
            delete p.deliverable_file_url;
            return { ...p, has_deliverable };
        });
    }
    async getDeliverableFile(userId, userRole, productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        const isOwner = product.user_id === userId;
        const isAdmin = userRole === 'admin';
        const hasCompletedTx = await this.prisma.transaction.findFirst({
            where: {
                product_id: productId,
                buyer_id: userId,
                status: 'completed',
            },
        });
        if (!isOwner && !isAdmin && !hasCompletedTx) {
            throw new common_1.ForbiddenException('You do not have access to this file.');
        }
        return { deliverable_file_url: product.deliverable_file_url };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map