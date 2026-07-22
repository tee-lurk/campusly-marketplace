import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ReviewProductDto {
  @IsString()
  @IsNotEmpty()
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
