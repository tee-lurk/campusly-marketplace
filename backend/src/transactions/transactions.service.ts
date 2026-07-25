import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /** GET /transactions — buyer's purchase history */
  async myPurchases(buyerId: string) {
    const txs = await this.prisma.transaction.findMany({
      where: { buyer_id: buyerId },
      include: {
        product: {
          include: {
            images: true,
            seller: { select: { id: true, profile: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return txs.map((tx) => {
      if (tx.product) {
        const has_deliverable = !!(tx.product as any).deliverable_file_url;
        delete (tx.product as any).deliverable_file_url;
        (tx as any).product = { ...tx.product, has_deliverable };
      }
      return tx;
    });
  }

  /** GET /transactions/:id — single transaction detail */
  async findOne(id: string, buyerId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, buyer_id: buyerId },
      include: {
        product: {
          include: { images: true, seller: { select: { id: true, profile: true } } },
        },
      },
    });
    if (!tx) throw new NotFoundException('Transaction not found.');
    if (tx.product) {
      const has_deliverable = !!(tx.product as any).deliverable_file_url;
      delete (tx.product as any).deliverable_file_url;
      (tx as any).product = { ...tx.product, has_deliverable };
    }
    return tx;
  }

  /**
   * POST /transactions — placeholder create (no Stripe logic yet).
   * In production this will initiate a Stripe PaymentIntent and
   * create the transaction record on webhook confirmation.
   */
  async create(buyerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found.');

    if (product.user_id === buyerId) {
      throw new BadRequestException('You cannot purchase your own product.');
    }

    // TODO: integrate Stripe — create PaymentIntent here
    // const paymentIntent = await stripe.paymentIntents.create({ ... });

    // TEMPORARY: fake checkout completion — replace with Stripe webhook confirmation when Stripe is integrated.
    const transaction = await this.prisma.transaction.create({
      data: {
        product_id: productId,
        buyer_id: buyerId,
        payment_id: null, // will be Stripe payment_intent.id after integration
        status: 'completed',
      },
      include: { product: true },
    });

    return transaction;
  }

  async remove(id: string, buyerId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, buyer_id: buyerId },
    });
    if (!tx) throw new NotFoundException('Transaction not found.');
    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Purchase record deleted.' };
  }

  async mySales(sellerId: string) {
    return this.prisma.transaction.findMany({
      where: {
        product: {
          user_id: sellerId,
        },
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            productType: true,
          },
        },
        buyer: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async addReview(id: string, buyerId: string, comment: string, rating?: number) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, buyer_id: buyerId, status: 'completed' },
    });
    if (!tx) throw new NotFoundException('Completed transaction not found.');

    return this.prisma.transaction.update({
      where: { id },
      data: {
        buyer_comment: comment,
        buyer_rating: rating ?? null,
      },
    });
  }
}
