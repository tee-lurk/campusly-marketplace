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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async myPurchases(buyerId) {
        const txs = await this.prisma.transaction.findMany({
            where: { buyer_id: buyerId },
            include: {
                product: {
                    include: {
                        images: true,
                        seller: { select: { id: true, profile: true } },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return txs.map((tx) => {
            if (tx.product) {
                const has_deliverable = !!tx.product.deliverable_file_url;
                delete tx.product.deliverable_file_url;
                tx.product = { ...tx.product, has_deliverable };
            }
            return tx;
        });
    }
    async findOne(id, buyerId) {
        const tx = await this.prisma.transaction.findFirst({
            where: { id, buyer_id: buyerId },
            include: {
                product: {
                    include: { images: true, seller: { select: { id: true, profile: true } } },
                },
            },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found.');
        if (tx.product) {
            const has_deliverable = !!tx.product.deliverable_file_url;
            delete tx.product.deliverable_file_url;
            tx.product = { ...tx.product, has_deliverable };
        }
        return tx;
    }
    async create(buyerId, productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        if (product.user_id === buyerId) {
            throw new common_1.BadRequestException('You cannot purchase your own product.');
        }
        const [transaction] = await this.prisma.$transaction([
            this.prisma.transaction.create({
                data: {
                    product_id: productId,
                    buyer_id: buyerId,
                    payment_id: null,
                    status: 'completed',
                },
                include: { product: true },
            }),
            this.prisma.product.update({
                where: { id: productId },
                data: { status: 'sold' },
            }),
        ]);
        return transaction;
    }
    async remove(id, buyerId) {
        const tx = await this.prisma.transaction.findFirst({
            where: { id, buyer_id: buyerId },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found.');
        await this.prisma.transaction.delete({ where: { id } });
        return { message: 'Purchase record deleted.' };
    }
    async mySales(sellerId) {
        return this.prisma.transaction.findMany({
            where: {
                product: {
                    user_id: sellerId,
                },
            },
            include: {
                product: {
                    include: {
                        images: true,
                        category: true,
                        productType: true,
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        profile: {
                            select: {
                                name: true,
                                username: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async addReview(id, buyerId, comment, rating) {
        const tx = await this.prisma.transaction.findFirst({
            where: { id, buyer_id: buyerId, status: 'completed' },
        });
        if (!tx)
            throw new common_1.NotFoundException('Completed transaction not found.');
        return this.prisma.transaction.update({
            where: { id },
            data: {
                buyer_comment: comment,
                buyer_rating: rating ?? null,
            },
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map