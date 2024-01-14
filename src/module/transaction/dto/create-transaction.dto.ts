import {
  IsArray,
  IsDateString,
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
  customerCode: string;

  @IsArray()
  item: { serviceCode: string; amount: number; employeeCode: string }[];

  @IsOptional()
  status: string;

  @IsDateString()
  bookingDate: Date;
}
