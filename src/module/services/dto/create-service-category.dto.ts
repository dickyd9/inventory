import { IsString } from 'class-validator';

export class CreateServiceCategoryDto {
  @IsString()
  categoryName: string;
}
