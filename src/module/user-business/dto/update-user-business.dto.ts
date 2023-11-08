import { PartialType } from '@nestjs/mapped-types';
import { CreateUserBusinessDto } from './create-user-business.dto';

export class UpdateUserBusinessDto extends PartialType(CreateUserBusinessDto) {}
