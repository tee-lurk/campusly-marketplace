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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser)
            throw new common_1.ConflictException('Email already registered.');
        const existingProfile = await this.prisma.profile.findUnique({
            where: { username: dto.username },
        });
        if (existingProfile)
            throw new common_1.ConflictException('Username already taken.');
        const password_hash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: { email: dto.email, password_hash, role: 'user' },
            });
            await tx.profile.create({
                data: {
                    user_id: newUser.id,
                    username: dto.username,
                    name: dto.name,
                    bio: null,
                    avatar_url: null,
                    is_verified: false,
                },
            });
            return newUser;
        });
        return this.generateTokens(user.id, user.email, user.role);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password.');
        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid email or password.');
        if (user.is_banned) {
            throw new common_1.ForbiddenException('Your account has been suspended. Contact support for more information.');
        }
        return this.generateTokens(user.id, user.email, user.role);
    }
    async refresh(dto) {
        let payload;
        try {
            payload = this.jwtService.verify(dto.refresh_token, {
                secret: process.env.JWT_REFRESH_SECRET ?? 'changeme_refresh',
            });
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired refresh token.');
        }
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user)
            throw new common_1.UnauthorizedException('User no longer exists.');
        if (user.is_banned) {
            throw new common_1.ForbiddenException('Your account has been suspended. Contact support for more information.');
        }
        return this.generateTokens(user.id, user.email, user.role);
    }
    generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const access_token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET ?? 'changeme',
            expiresIn: ACCESS_EXPIRES,
        });
        const refresh_token = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET ?? 'changeme_refresh',
            expiresIn: REFRESH_EXPIRES,
        });
        return { access_token, refresh_token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map