import { Controller, Get, Query } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';

@Controller('product-types')
export class ProductTypesController {
  constructor(private readonly service: ProductTypesService) {}

  /** GET /product-types?category_id=xxx */
  @Get()
  findAll(@Query('category_id') categoryId?: string) {
    return this.service.findAll(categoryId);
  }
}
