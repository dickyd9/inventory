import { PartialType } from '@nestjs/mapped-types';
import { ProfileUserDto } from './profile-user.dto';

export class UpdateProfileDto extends PartialType(ProfileUserDto) {}
