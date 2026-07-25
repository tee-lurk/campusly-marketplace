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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const admin_service_1 = require("./admin.service");
const review_product_dto_1 = require("./dto/review-product.dto");
const review_verification_dto_1 = require("./dto/review-verification.dto");
const ban_user_dto_1 = require("./dto/ban-user.dto");
const category_dto_1 = require("./dto/category.dto");
const product_type_dto_1 = require("./dto/product-type.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getStats() {
        return this.adminService.getStats();
    }
    getTimeseries(range) {
        const validRange = range === '30d' ? '30d' : '7d';
        return this.adminService.getTimeseries(validRange);
    }
    getRecentActivity(filter, limit) {
        const validFilter = ['all', 'listings', 'transactions', 'reports'].includes(filter ?? '')
            ? filter
            : 'all';
        const numLimit = Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 100);
        return this.adminService.getRecentActivity(validFilter, numLimit);
    }
    getPendingQueue() {
        return this.adminService.getPendingQueue();
    }
    getAllListings(search, category, page) {
        return this.adminService.getAllListings(search, category, parseInt(page ?? '1', 10) || 1);
    }
    reviewProduct(req, id, dto) {
        return this.adminService.reviewProduct(req.user.id, id, dto);
    }
    removeListing(id) {
        return this.adminService.removeListing(id);
    }
    getUsers(search, role, page) {
        return this.adminService.getUsers(search, role, parseInt(page ?? '1', 10) || 1);
    }
    getUserDetail(id) {
        return this.adminService.getUserDetail(id);
    }
    banUser(req, id, dto) {
        return this.adminService.banUser(req.user.id, id, dto);
    }
    unbanUser(id) {
        return this.adminService.unbanUser(id);
    }
    getTransactions(search, status, page) {
        return this.adminService.getTransactions(search, status, parseInt(page ?? '1', 10) || 1);
    }
    getVerifications() {
        return this.adminService.getVerifications();
    }
    reviewVerification(req, userId, dto) {
        return this.adminService.reviewVerification(req.user.id, userId, dto);
    }
    getCategories() {
        return this.adminService.getCategories();
    }
    createCategory(dto) {
        return this.adminService.createCategory(dto.name);
    }
    updateCategory(id, dto) {
        return this.adminService.updateCategory(id, dto.name);
    }
    deleteCategory(id) {
        return this.adminService.deleteCategory(id);
    }
    getProductTypes() {
        return this.adminService.getProductTypes();
    }
    createProductType(dto) {
        return this.adminService.createProductType(dto.name, dto.category_id);
    }
    updateProductType(id, dto) {
        return this.adminService.updateProductType(id, dto.name);
    }
    deleteProductType(id) {
        return this.adminService.deleteProductType(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('stats/timeseries'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTimeseries", null);
__decorate([
    (0, common_1.Get)('activity/recent'),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPendingQueue", null);
__decorate([
    (0, common_1.Get)('products/all'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllListings", null);
__decorate([
    (0, common_1.Patch)('products/:id/review'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_product_dto_1.ReviewProductDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reviewProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "removeListing", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ban_user_dto_1.BanUserDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/unban'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "unbanUser", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('verifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getVerifications", null);
__decorate([
    (0, common_1.Patch)('verifications/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_verification_dto_1.ReviewVerificationDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reviewVerification", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('product-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProductTypes", null);
__decorate([
    (0, common_1.Post)('product-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_type_dto_1.CreateProductTypeDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createProductType", null);
__decorate([
    (0, common_1.Patch)('product-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_type_dto_1.UpdateProductTypeDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProductType", null);
__decorate([
    (0, common_1.Delete)('product-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProductType", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map