import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ReviewProductDto } from './dto/review-product.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateProductTypeDto, UpdateProductTypeDto } from './dto/product-type.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Stats ────────────────────────────────────────────────────────────────

  /** GET /admin/stats */
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  /** GET /admin/stats/timeseries?range=7d|30d */
  @Get('stats/timeseries')
  getTimeseries(@Query('range') range?: string) {
    const validRange = range === '30d' ? '30d' : '7d';
    return this.adminService.getTimeseries(validRange);
  }

  // ─── Activity Feed ────────────────────────────────────────────────────────

  /** GET /admin/activity/recent?filter=all|listings|transactions|reports&limit=20 */
  @Get('activity/recent')
  getRecentActivity(
    @Query('filter') filter?: string,
    @Query('limit') limit?: string,
  ) {
    const validFilter = ['all', 'listings', 'transactions', 'reports'].includes(filter ?? '')
      ? filter!
      : 'all';
    const numLimit = Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 100);
    return this.adminService.getRecentActivity(validFilter, numLimit);
  }

  // ─── Pending Queue ────────────────────────────────────────────────────────

  /** GET /admin/products — pending review queue */
  @Get('products')
  getPendingQueue() {
    return this.adminService.getPendingQueue();
  }

  /** GET /admin/products/all — content monitor (paginated) */
  @Get('products/all')
  getAllListings(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getAllListings(search, category, parseInt(page ?? '1', 10) || 1);
  }

  /** PATCH /admin/products/:id/review — approve or reject */
  @Patch('products/:id/review')
  reviewProduct(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewProductDto,
  ) {
    return this.adminService.reviewProduct(req.user.id, id, dto);
  }

  /** DELETE /admin/products/:id — force remove listing */
  @Delete('products/:id')
  removeListing(@Param('id') id: string) {
    return this.adminService.removeListing(id);
  }

  // ─── User Management ─────────────────────────────────────────────────────

  /** GET /admin/users?search=&role=&page= */
  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getUsers(search, role, parseInt(page ?? '1', 10) || 1);
  }

  /** GET /admin/users/:id — user detail */
  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  /** PATCH /admin/users/:id/ban — ban a user */
  @Patch('users/:id/ban')
  banUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: BanUserDto,
  ) {
    return this.adminService.banUser(req.user.id, id, dto);
  }

  /** PATCH /admin/users/:id/unban — lift ban */
  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  // ─── Transactions ─────────────────────────────────────────────────────────

  /** GET /admin/transactions?search=&status=&page= */
  @Get('transactions')
  getTransactions(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getTransactions(search, status, parseInt(page ?? '1', 10) || 1);
  }

  // ─── Verifications ────────────────────────────────────────────────────────

  /** GET /admin/verifications */
  @Get('verifications')
  getVerifications() {
    return this.adminService.getVerifications();
  }

  /** PATCH /admin/verifications/:userId */
  @Patch('verifications/:userId')
  reviewVerification(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.adminService.reviewVerification(req.user.id, userId, dto);
  }

  // ─── Platform Settings: Categories ────────────────────────────────────────

  /** GET /admin/categories */
  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  /** POST /admin/categories */
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto.name);
  }

  /** PATCH /admin/categories/:id */
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto.name);
  }

  /** DELETE /admin/categories/:id */
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Platform Settings: Product Types ─────────────────────────────────────

  /** GET /admin/product-types */
  @Get('product-types')
  getProductTypes() {
    return this.adminService.getProductTypes();
  }

  /** POST /admin/product-types */
  @Post('product-types')
  createProductType(@Body() dto: CreateProductTypeDto) {
    return this.adminService.createProductType(dto.name, dto.category_id);
  }

  /** PATCH /admin/product-types/:id */
  @Patch('product-types/:id')
  updateProductType(@Param('id') id: string, @Body() dto: UpdateProductTypeDto) {
    return this.adminService.updateProductType(id, dto.name);
  }

  /** DELETE /admin/product-types/:id */
  @Delete('product-types/:id')
  deleteProductType(@Param('id') id: string) {
    return this.adminService.deleteProductType(id);
  }
}
