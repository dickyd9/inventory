import { Controller, Get, Param, Query } from '@nestjs/common';
import { PosService } from './pos.service';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('menu')
  getMenu(
    @Query('categoryName') categoryName: string,
    @Query('keyword') keyword: any,
  ) {
    return this.posService.getMenu(categoryName, keyword);
  }

  @Get('customer-list')
  getCustomer() {
    return this.posService.getCustomer();
  }

  @Get('employee-list')
  getEmployee() {
    return this.posService.getEmployee();
  }

  @Get('services-category')
  getServicesCategory() {
    return this.posService.getCategory();
  }
}
