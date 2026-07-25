import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const targetStatus =
      !query.status || query.status === 'approved'
        ? { in: ['approved', 'sold'] }
        : (query.status as any);

    const products = await this.prisma.product.findMany({
      where: {
        status: targetStatus,
        ...(query.seller_id ? { user_id: query.seller_id } : { is_hidden: false }),
        ...(query.category_id ? { category_id: query.category_id } : {}),
        ...(query.product_type_id
          ? { product_type_id: query.product_type_id }
          : {}),
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        seller: { select: { id: true, profile: true } },
        category: true,
        productType: true,
        images: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return products.map((p) => {
      const has_deliverable = !!p.deliverable_file_url;
      delete (p as any).deliverable_file_url;
      return { ...p, has_deliverable };
    });
  }

  async findOne(id: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, profile: true } },
        category: true,
        productType: true,
        images: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found.');

    let has_purchased = false;
    let purchased_at: Date | null = null;
    if (userId) {
      const tx = await this.prisma.transaction.findFirst({
        where: {
          product_id: id,
          buyer_id: userId,
          status: 'completed',
        },
        orderBy: { created_at: 'desc' },
      });
      if (tx) {
        has_purchased = true;
        purchased_at = tx.created_at;
      }
    }

    const has_deliverable = !!product.deliverable_file_url;
    delete (product as any).deliverable_file_url;
    return { ...product, has_deliverable, has_purchased, purchased_at };
  }

  async create(userId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        user_id: userId,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        category_id: dto.category_id,
        product_type_id: dto.product_type_id,
        deliverable_file_url: dto.deliverable_file_url,
        status: 'pending',
        images: dto.images?.length
          ? {
              create: dto.images.map((url) => ({ image_url: url })),
            }
          : undefined,
      },
      include: { images: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.user_id !== userId)
      throw new ForbiddenException('You do not own this listing.');

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.price ? { price: dto.price } : {}),
        ...(dto.deliverable_file_url !== undefined
          ? { deliverable_file_url: dto.deliverable_file_url }
          : {}),
        status: 'pending', // re-submit for review on any edit
        images: dto.images !== undefined
          ? {
              deleteMany: {},
              create: dto.images.map((url) => ({ image_url: url })),
            }
          : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.user_id !== userId)
      throw new ForbiddenException('You do not own this listing.');

    await this.prisma.product.delete({ where: { id } });
    return { message: 'Listing deleted.' };
  }

  async myListings(userId: string) {
    const products = await this.prisma.product.findMany({
      where: { user_id: userId },
      include: { images: true, category: true, productType: true },
      orderBy: { created_at: 'desc' },
    });
    return products.map((p) => {
      const has_deliverable = !!p.deliverable_file_url;
      delete (p as any).deliverable_file_url;
      return { ...p, has_deliverable };
    });
  }

  async getDeliverableFile(userId: string, userRole: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found.');

    const isOwner = product.user_id === userId;
    const isAdmin = userRole === 'admin';
    const hasCompletedTx = await this.prisma.transaction.findFirst({
      where: {
        product_id: productId,
        buyer_id: userId,
        status: 'completed',
      },
    });

    if (!isOwner && !isAdmin && !hasCompletedTx) {
      throw new ForbiddenException('You do not have access to this file.');
    }

    return { deliverable_file_url: product.deliverable_file_url };
  }

  async toggleHide(userId: string, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.user_id !== userId)
      throw new ForbiddenException('You do not own this listing.');

    return this.prisma.product.update({
      where: { id },
      data: {
        is_hidden: !product.is_hidden,
      },
    });
  }
}
