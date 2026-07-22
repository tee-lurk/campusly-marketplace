import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;
}

class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /** GET /transactions — my purchase history */
  @Get()
  myPurchases(@Request() req: any) {
    return this.transactionsService.myPurchases(req.user.id);
  }

  /** GET /transactions/sales — my sales & earnings */
  @Get('sales')
  mySales(@Request() req: any) {
    return this.transactionsService.mySales(req.user.id);
  }

  /** GET /transactions/:id */
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  /** POST /transactions — initiate purchase (Stripe integration pending) */
  @Post()
  create(@Request() req: any, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, dto.product_id);
  }

  /** DELETE /transactions/:id */
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.transactionsService.remove(id, req.user.id);
  }

  /** POST /transactions/:id/review */
  @Post(':id/review')
  addReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.transactionsService.addReview(
      id,
      req.user.id,
      dto.comment,
      dto.rating,
    );
  }
}
