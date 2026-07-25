"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { user_id: userId },
            include: { user: { select: { email: true, role: true, created_at: true } } },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found.');
        return profile;
    }
    async updateProfile(userId, dto) {
        return this.prisma.profile.update({
            where: { user_id: userId },
            data: { ...dto },
        });
    }
    async updatePassword(userId, oldPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        const isValid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isValid) {
            throw new common_1.BadRequestException('Incorrect current password.');
        }
        const hashed = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashed },
        });
        return { message: 'Password updated successfully.' };
    }
    async getNotifications(userId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [reviews, sales] = await Promise.all([
            this.prisma.productReview.findMany({
                where: {
                    product: { user_id: userId },
                    reviewed_at: { gte: sevenDaysAgo },
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            status: true,
                            images: { take: 1 },
                        },
                    },
                },
                orderBy: { reviewed_at: 'desc' },
                take: 20,
            }),
            this.prisma.transaction.findMany({
                where: {
                    product: { user_id: userId },
                    status: 'completed',
                    created_at: { gte: sevenDaysAgo },
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            images: { take: 1 },
                        },
                    },
                    buyer: {
                        select: {
                            profile: {
                                select: { username: true, avatar_url: true },
                            },
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                take: 20,
            }),
        ]);
        const notifications = [];
        for (const r of reviews) {
            notifications.push({
                id: `review-${r.id}`,
                type: r.status === 'rejected' ? 'rejection' : 'approval',
                product: r.product,
                reason: r.reason,
                timestamp: r.reviewed_at,
            });
        }
        for (const s of sales) {
            notifications.push({
                id: `sale-${s.id}`,
                type: 'sale',
                product: s.product,
                buyer: s.buyer,
                timestamp: s.created_at,
            });
        }
        notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return notifications.slice(0, 30);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map