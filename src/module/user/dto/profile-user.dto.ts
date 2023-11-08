import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ProfileUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsOptional()
  gender: string;
}
