import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenses {
  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  itemId: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  price: number;
}
