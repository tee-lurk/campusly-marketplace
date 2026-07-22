import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsNotEmpty({ message: 'A ban reason is required.' })
  @MaxLength(500)
  reason: string;
}
