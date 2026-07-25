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
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** GET /products — public listing feed with optional filters */
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  /** GET /products/mine — own listings (authenticated) */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  myListings(@Request() req: any) {
    return this.productsService.myListings(req.user.id);
  }

  /** GET /products/:id — single product detail */
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    let userId: string | undefined = undefined;
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
          const payload = JSON.parse(jsonPayload);
          userId = payload.sub || payload.id;
        }
      } catch (e) {
        // ignore invalid token header
      }
    }
    return this.productsService.findOne(id, userId);
  }

  /** GET /products/:id/download — get deliverable file url */
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  downloadFile(@Request() req: any, @Param('id') id: string) {
    return this.productsService.getDeliverableFile(req.user.id, req.user.role, id);
  }

  /** POST /products — create listing (authenticated) */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.id, dto);
  }

  /** PATCH /products/:id/toggle-hide — hide or unhide own listing */
  @Patch(':id/toggle-hide')
  @UseGuards(JwtAuthGuard)
  toggleHide(@Request() req: any, @Param('id') id: string) {
    return this.productsService.toggleHide(req.user.id, id);
  }

  /** PATCH /products/:id — update own listing */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.id, id, dto);
  }

  /** DELETE /products/:id — delete own listing */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.productsService.remove(req.user.id, id);
  }
}
