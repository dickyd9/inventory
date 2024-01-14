import { Controller, Get } from '@nestjs/common';
import { MasterService } from './master.service';

@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}
  @Get('/category')
  getAllData() {
    return this.masterService.getItemCategory();
  }

  @Get('/item')
  getallItem() {
    return this.masterService.getAllItem();
  }
}
