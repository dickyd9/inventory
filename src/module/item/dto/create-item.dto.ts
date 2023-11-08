import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  itemName: string;

  @IsNumber()
  itemPrice: number;

  @IsString()
  @IsOptional()
  itemCategory: string;

  @IsNumber()
  @IsOptional()
  itemPoint: number;

  @IsString()
  itemType: string;

  @IsString()
  itemStatus: string;
}