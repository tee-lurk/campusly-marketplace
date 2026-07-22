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
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
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
