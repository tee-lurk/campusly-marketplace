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
    async getStats() {
        const [totalListings, pendingCount, approvedCount, rejectedCount, totalUsers, completedTransactions, revenueAgg, reviews] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.product.count({ where: { status: 'pending' } }),
            this.prisma.product.count({ where: { status: { in: ['approved', 'sold'] } } }),
            this.prisma.product.count({ where: { status: 'rejected' } }),
            this.prisma.user.count(),
            this.prisma.transaction.count({ where: { status: 'completed' } }),
            this.prisma.transaction.findMany({
                where: { status: 'completed' },
                select: { product: { select: { price: true } } },
            }),
            this.prisma.productReview.findMany({
                select: {
                    reviewed_at: true,
                    product: { select: { created_at: true } },
                },
            }),
        ]);
        const totalRevenue = revenueAgg.reduce((sum, tx) => sum + (tx.product?.price ?? 0), 0);
        let avgReviewTimeHours = 4.2;
        let withinSlaCount = 0;
        if (reviews.length > 0) {
            let validCount = 0;
            let totalMs = 0;
            for (const r of reviews) {
                if (r.product?.created_at && r.reviewed_at) {
                    const diffMs = Math.max(0, r.reviewed_at.getTime() - r.product.created_at.getTime());
                    totalMs += diffMs;
                    validCount++;
                    if (diffMs <= 24 * 60 * 60 * 1000) {
                        withinSlaCount++;
                    }
                }
            }
            if (validCount > 0) {
                avgReviewTimeHours = Number((totalMs / (validCount * 1000 * 60 * 60)).toFixed(1));
            }
        }
        const slaCompliancePct = reviews.length > 0 ? Math.round((withinSlaCount / reviews.length) * 100) : 95;
        const categoryCounts = await this.prisma.category.findMany({
            select: {
                name: true,
                _count: { select: { products: true } },
            },
            orderBy: { products: { _count: 'desc' } },
        });
        const categoryBreakdown = categoryCounts.map((c) => ({
            name: c.name,
            count: c._count.products,
        }));
        return {
            totalListings,
            pendingCount,
            approvedCount,
            rejectedCount,
            totalUsers,
            completedTransactions,
            totalRevenue,
            avgReviewTimeHours,
            slaCompliancePct,
            totalReviewsCount: reviews.length,
            categoryBreakdown,
        };
    }
    async getTimeseries(range) {
        const days = range === '7d' ? 7 : 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        since.setHours(0, 0, 0, 0);
        const listingsByDay = await this.prisma.$queryRawUnsafe(`SELECT DATE("created_at") as day, COUNT(*)::bigint as count
       FROM "Product"
       WHERE "created_at" >= $1
       GROUP BY DATE("created_at")
       ORDER BY day ASC`, since);
        const txByDay = await this.prisma.$queryRawUnsafe(`SELECT DATE("created_at") as day, COUNT(*)::bigint as count
       FROM "Transaction"
       WHERE "created_at" >= $1
       GROUP BY DATE("created_at")
       ORDER BY day ASC`, since);
        const listingsMap = new Map();
        for (const row of listingsByDay) {
            const key = new Date(row.day).toISOString().split('T')[0];
            listingsMap.set(key, Number(row.count));
        }
        const txMap = new Map();
        for (const row of txByDay) {
            const key = new Date(row.day).toISOString().split('T')[0];
            txMap.set(key, Number(row.count));
        }
        const result = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(since);
            d.setDate(since.getDate() + i);
            const key = d.toISOString().split('T')[0];
            result.push({
                date: key,
                listingsCount: listingsMap.get(key) ?? 0,
                transactionsCount: txMap.get(key) ?? 0,
            });
        }
        return result;
    }
    async getRecentActivity(filter, limit) {
        const items = [];
        const shouldInclude = (t) => filter === 'all' || filter === t;
        if (shouldInclude('listings')) {
            const listings = await this.prisma.product.findMany({
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    seller: { select: { profile: { select: { username: true } } } },
                },
            });
            for (const l of listings) {
                items.push({
                    id: l.id,
                    type: 'listing',
                    description: `@${l.seller?.profile?.username ?? 'unknown'} listed "${l.title}" for ETB ${l.price.toLocaleString()}`,
                    timestamp: l.created_at.toISOString(),
                    relatedId: l.id,
                });
            }
        }
        if (shouldInclude('transactions')) {
            const txs = await this.prisma.transaction.findMany({
                take: limit,
                where: { status: 'completed' },
                orderBy: { created_at: 'desc' },
                include: {
                    buyer: { select: { profile: { select: { username: true } } } },
                    product: { select: { title: true, price: true } },
                },
            });
            for (const tx of txs) {
                items.push({
                    id: tx.id,
                    type: 'transaction',
                    description: `@${tx.buyer?.profile?.username ?? 'unknown'} purchased "${tx.product?.title ?? 'Unknown'}" for ETB ${tx.product?.price?.toLocaleString() ?? '0'}`,
                    timestamp: tx.created_at.toISOString(),
                    relatedId: tx.id,
                });
            }
        }
        if (shouldInclude('reports')) {
            const reported = await this.prisma.product.findMany({
                take: limit,
                where: { report_count: { gt: 0 } },
                orderBy: { created_at: 'desc' },
                include: {
                    seller: { select: { profile: { select: { username: true } } } },
                },
            });
            for (const r of reported) {
                items.push({
                    id: r.id,
                    type: 'report',
                    description: `"${r.title}" by @${r.seller?.profile?.username ?? 'unknown'} has ${r.report_count} report${r.report_count !== 1 ? 's' : ''}`,
                    timestamp: r.created_at.toISOString(),
                    relatedId: r.id,
                });
            }
        }
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return items.slice(0, limit);
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
    async getAllListings(search, category, page = 1, pageSize = 20) {
        const where = { status: { not: 'pending' } };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { seller: { profile: { username: { contains: search, mode: 'insensitive' } } } },
            ];
        }
        if (category) {
            where.category_id = category;
        }
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    seller: { select: { id: true, profile: true } },
                    category: true,
                    productType: true,
                    images: true,
                },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.product.count({ where }),
        ]);
        return { data, total, page, pageSize };
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
    async getUsers(search, role, page = 1, pageSize = 20) {
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { profile: { username: { contains: search, mode: 'insensitive' } } },
                { profile: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (role && (role === 'user' || role === 'admin')) {
            where.role = role;
        }
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    is_banned: true,
                    banned_reason: true,
                    banned_at: true,
                    created_at: true,
                    profile: {
                        select: {
                            username: true,
                            name: true,
                            avatar_url: true,
                            is_verified: true,
                        },
                    },
                    _count: { select: { products: true } },
                },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data, total, page, pageSize };
    }
    async getUserDetail(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                products: {
                    include: { images: true, category: true, productType: true },
                    orderBy: { created_at: 'desc' },
                },
                transactions: {
                    include: {
                        product: {
                            include: { images: true, seller: { select: { id: true, profile: { select: { username: true, name: true } } } } },
                        },
                    },
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        return user;
    }
    async banUser(adminId, userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        if (user.role === 'admin') {
            throw new common_1.BadRequestException('Cannot ban an admin account.');
        }
        if (user.is_banned) {
            throw new common_1.BadRequestException('User is already banned.');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                is_banned: true,
                banned_reason: dto.reason,
                banned_at: new Date(),
            },
            select: {
                id: true,
                email: true,
                is_banned: true,
                banned_reason: true,
                banned_at: true,
            },
        });
    }
    async unbanUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        if (!user.is_banned) {
            throw new common_1.BadRequestException('User is not banned.');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                is_banned: false,
                banned_reason: null,
                banned_at: null,
            },
            select: {
                id: true,
                email: true,
                is_banned: true,
            },
        });
    }
    async getTransactions(search, status, page = 1, pageSize = 20) {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { product: { title: { contains: search, mode: 'insensitive' } } },
                { buyer: { profile: { username: { contains: search, mode: 'insensitive' } } } },
                { product: { seller: { profile: { username: { contains: search, mode: 'insensitive' } } } } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: {
                    product: {
                        include: {
                            images: { take: 1 },
                            seller: {
                                select: {
                                    id: true,
                                    profile: { select: { username: true, name: true, avatar_url: true } },
                                },
                            },
                        },
                    },
                    buyer: {
                        select: {
                            id: true,
                            profile: { select: { username: true, name: true, avatar_url: true } },
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return { data, total, page, pageSize };
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
    async getCategories() {
        return this.prisma.category.findMany({
            include: {
                productTypes: {
                    include: { _count: { select: { products: true } } },
                    orderBy: { name: 'asc' },
                },
                _count: { select: { products: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(name) {
        const existing = await this.prisma.category.findUnique({ where: { name } });
        if (existing)
            throw new common_1.BadRequestException(`Category "${name}" already exists.`);
        return this.prisma.category.create({ data: { name } });
    }
    async updateCategory(id, name) {
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Category not found.');
        return this.prisma.category.update({ where: { id }, data: { name } });
    }
    async deleteCategory(id) {
        const cat = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!cat)
            throw new common_1.NotFoundException('Category not found.');
        if (cat._count.products > 0) {
            throw new common_1.BadRequestException(`Cannot delete "${cat.name}" — ${cat._count.products} product(s) still reference this category. Remove or reassign them first.`);
        }
        await this.prisma.category.delete({ where: { id } });
        return { message: `Category "${cat.name}" deleted.` };
    }
    async getProductTypes() {
        return this.prisma.productType.findMany({
            include: {
                category: { select: { id: true, name: true } },
                _count: { select: { products: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createProductType(name, categoryId) {
        const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
        if (!category)
            throw new common_1.NotFoundException('Parent category not found.');
        const existing = await this.prisma.productType.findFirst({
            where: { name, category_id: categoryId },
        });
        if (existing)
            throw new common_1.BadRequestException(`Product type "${name}" already exists in this category.`);
        return this.prisma.productType.create({
            data: { name, category_id: categoryId },
            include: { category: { select: { id: true, name: true } } },
        });
    }
    async updateProductType(id, name) {
        const pt = await this.prisma.productType.findUnique({ where: { id } });
        if (!pt)
            throw new common_1.NotFoundException('Product type not found.');
        return this.prisma.productType.update({
            where: { id },
            data: { name },
            include: { category: { select: { id: true, name: true } } },
        });
    }
    async deleteProductType(id) {
        const pt = await this.prisma.productType.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!pt)
            throw new common_1.NotFoundException('Product type not found.');
        if (pt._count.products > 0) {
            throw new common_1.BadRequestException(`Cannot delete "${pt.name}" — ${pt._count.products} product(s) still reference this type. Remove or reassign them first.`);
        }
        await this.prisma.productType.delete({ where: { id } });
        return { message: `Product type "${pt.name}" deleted.` };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map