import { IsString } from 'class-validator';

export class OutletDto {
  outletName: string;
  outletAddress: string;
}

export class assignItemDto {
  itemId: string;
}

export class CreateBusinessDto {
  @IsString()
  businessName: string;

  @IsString()
  businessAddress: string;
}
