import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  customerName: string;

  @IsString()
  @IsOptional()
  customerAddress: string;

  @IsString()
  @IsOptional()
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerDOB: string;

  @IsString()
  customerContact: number;

  @IsEnum(['male', 'female'])
  @IsString()
  customerGender: string;
}
