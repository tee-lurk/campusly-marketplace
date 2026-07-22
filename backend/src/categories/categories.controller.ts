import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  /** GET /categories */
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
