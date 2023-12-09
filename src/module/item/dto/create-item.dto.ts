import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  itemName: string;

  @IsNumber()
  itemPrice: number;

  @IsString()
  @IsOptional()
  itemUnit: string;

  @IsNumber()
  @IsOptional()
  itemAmount: number;
}