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
exports.ProductTypesController = void 0;
const common_1 = require("@nestjs/common");
const product_types_service_1 = require("./product-types.service");
let ProductTypesController = class ProductTypesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(categoryId) {
        return this.service.findAll(categoryId);
    }
};
exports.ProductTypesController = ProductTypesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductTypesController.prototype, "findAll", null);
exports.ProductTypesController = ProductTypesController = __decorate([
    (0, common_1.Controller)('product-types'),
    __metadata("design:paramtypes", [product_types_service_1.ProductTypesService])
], ProductTypesController);
//# sourceMappingURL=product-types.controller.js.map