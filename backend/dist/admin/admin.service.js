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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPendingQueue() {
        return this.prisma.product.findMany({
            where: { status: 'pending' },
            include: {
                seller: { select: { id: true, profile: true } },
                category: true,
                productType: true,
                images: true,
            },
            orderBy: { created_at: 'asc' },
        });
    }
    async reviewProduct(adminId, productId, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        if (product.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending listings can be reviewed.');
        }
        if (dto.action === 'reject' && !dto.reason) {
            throw new common_1.BadRequestException('A rejection reason is required.');
        }
        const newStatus = dto.action === 'approve' ? 'approved' : 'rejected';
        const [updatedProduct] = await this.prisma.$transaction([
            this.prisma.product.update({
                where: { id: productId },
                data: { status: newStatus },
            }),
            this.prisma.productReview.create({
                data: {
                    product_id: productId,
                    admin_id: adminId,
                    status: newStatus,
                    reason: dto.reason ?? null,
                },
            }),
        ]);
        return updatedProduct;
    }
    async getAllListings() {
        return this.prisma.product.findMany({
            where: { status: { not: 'pending' } },
            include: {
                seller: { select: { id: true, profile: true } },
                category: true,
                productType: true,
                images: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async removeListing(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        await this.prisma.product.delete({ where: { id: productId } });
        return { message: 'Listing removed by admin.' };
    }
    async getStats() {
        const [totalListings, activeUsers, pendingReview, totalTransactions] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.user.count(),
            this.prisma.product.count({ where: { status: 'pending' } }),
            this.prisma.transaction.count(),
        ]);
        return { totalListings, activeUsers, pendingReview, totalTransactions };
    }
    async getVerifications() {
        return this.prisma.profile.findMany({
            include: {
                user: { select: { id: true, email: true, role: true, created_at: true } },
            },
            orderBy: { user: { created_at: 'desc' } },
        });
    }
    async reviewVerification(adminId, userId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { user_id: userId },
        });
        if (!profile)
            throw new common_1.NotFoundException('User profile not found.');
        if ((dto.action === 'reject' || dto.action === 'revoke') && !dto.reason) {
            throw new common_1.BadRequestException('A reason is required to reject or revoke student verification.');
        }
        if (dto.action === 'approve') {
            return this.prisma.profile.update({
                where: { user_id: userId },
                data: {
                    is_verified: true,
                    verification_status: 'verified',
                    verification_reason: null,
                },
            });
        }
        else {
            return this.prisma.profile.update({
                where: { user_id: userId },
                data: {
                    is_verified: false,
                    verification_status: 'rejected',
                    verification_reason: dto.reason ?? 'Verification revoked by administrator.',
                },
            });
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map