import { IsString } from 'class-validator';

export class UserRoleDto {
  @IsString()
  roleName: string;

  @IsString()
  roleStatus: string;
}
