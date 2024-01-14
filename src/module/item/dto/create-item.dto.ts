import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  itemName: string;

  @IsNumber()
  itemPrice: number;

  @IsString()
  @IsOptional()
  itemType: string;

  @IsString()
  @IsOptional()
  itemUnit: string;

  @IsNumber()
  @IsOptional()
  itemAmount: number;

  @IsString()
  @IsOptional()
  itemStatus: string;

  @IsArray()
  @IsOptional()
  itemUseService: string[];
}
export class ItemCategoryDto {
  @IsString()
  categoryName: string;
}