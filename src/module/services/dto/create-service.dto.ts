import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  servicesName: string;

  @IsNumber()
  servicesPrice: number;

  @IsString()
  @IsOptional()
  servicesCategory: string;

  @IsNumber()
  @IsOptional()
  servicesPoint: number;

  @IsString()
  servicesStatus: string;
}