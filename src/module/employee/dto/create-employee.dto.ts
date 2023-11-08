import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  employeeName: string;

  @IsString()
  employeeAddress: string;

  @IsNumber()
  employeeContact: number;

  @IsDateString()
  employeeJoinDate: Date;

  @IsEnum(['male', 'female'])
  @IsString()
  employeeGender: string;
}
