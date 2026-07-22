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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const cloudinary_service_1 = require("./cloudinary.service");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
function imageFileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
        cb(new common_1.BadRequestException('Only image files are allowed (JPEG, PNG, WEBP, etc.).'), false);
        return;
    }
    cb(null, true);
}
let UploadsController = class UploadsController {
    cloudinaryService;
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    async uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided. Send a "file" field in multipart/form-data.');
        }
        try {
            const url = await this.cloudinaryService.uploadBuffer(file.buffer);
            return { url };
        }
        catch (err) {
            if (err?.status)
                throw err;
            throw new common_1.InternalServerErrorException(`Image upload failed: ${err?.message ?? 'unknown error'}`);
        }
    }
    async uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided. Send a "file" field in multipart/form-data.');
        }
        try {
            const url = await this.cloudinaryService.uploadBuffer(file.buffer);
            return { url };
        }
        catch (err) {
            if (err?.status)
                throw err;
            throw new common_1.InternalServerErrorException(`File upload failed: ${err?.message ?? 'unknown error'}`);
        }
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: imageFileFilter,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('file'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadFile", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map