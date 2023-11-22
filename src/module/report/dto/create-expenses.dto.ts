import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenses {
  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsNumber()
  price: number;
}
