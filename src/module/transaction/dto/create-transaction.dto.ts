import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTicketTransactionDto {
  @IsString()
  userId: string;

  @IsString()
  customerCode: string;

  @IsString()
  employeeCode: string;
}

export class CreateTransactionDto {
  @IsArray()
  @IsString({ each: true })
  item: string[];

  @IsString()
  totalAmount: string;

  @IsNumber()
  totalPrice: number;

  @IsEnum(['created', 'completed'])
  @IsOptional()
  status?: string;
}

export class CreateBookingDto {
  @IsString()
  userId: string;

  @IsString()
  customerCode: string;

  @IsString()
  employeeCode: string;

  @IsArray()
  @IsString({ each: true })
  item: string[];

  @IsString()
  totalAmount: string;

  @IsNumber()
  totalPrice: number;

  @IsEnum(['created', 'completed'])
  @IsOptional()
  status?: string;
}
