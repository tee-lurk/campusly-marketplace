import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  category_id: string;
}

export class UpdateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
