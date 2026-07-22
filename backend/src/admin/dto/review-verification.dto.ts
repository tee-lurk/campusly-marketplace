import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewVerificationDto {
  @IsIn(['approve', 'reject', 'revoke'])
  action: 'approve' | 'reject' | 'revoke';

  @IsOptional()
  @IsString()
  reason?: string;
}
