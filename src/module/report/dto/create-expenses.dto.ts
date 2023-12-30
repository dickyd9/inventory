import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenses {
  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  itemCode: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsNumber()
  @IsOptional()
  amount: number;

  @IsNumber()
  @IsOptional()
  price: number;
}
