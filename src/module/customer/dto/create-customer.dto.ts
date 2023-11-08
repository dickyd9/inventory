import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  customerName: string;

  @IsString()
  customerAddress: string;

  @IsString()
  customerEmail: string;

  @IsString()
  customerDOB: string;

  @IsString()
  customerContact: number;

  @IsEnum(['male', 'female'])
  @IsString()
  customerGender: string;
}
