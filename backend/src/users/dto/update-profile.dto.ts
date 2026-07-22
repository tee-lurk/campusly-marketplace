import {
  IsString,
  IsOptional,
  MaxLength,
  IsUrl,
  IsBoolean,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  student_id?: string;

  @IsOptional()
  @IsString()
  student_id_card_url?: string;

  @IsOptional()
  @IsString()
  verification_status?: string;

  @IsOptional()
  @IsString()
  verification_reason?: string;

  @IsOptional()
  @IsBoolean()
  notify_email?: boolean;

  @IsOptional()
  @IsBoolean()
  notify_push?: boolean;

  @IsOptional()
  @IsBoolean()
  notify_sms?: boolean;
}
