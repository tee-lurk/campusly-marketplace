import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductTypesService {
  constructor(private prisma: PrismaService) {}

  findAll(categoryId?: string) {
    return this.prisma.productType.findMany({
      where: categoryId ? { category_id: categoryId } : undefined,
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
  }
}
