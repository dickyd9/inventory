import { Controller, Get, Query } from '@nestjs/common';
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
  getCustomer(@Query('keyword') keyword: string) {
    return this.posService.getCustomer(keyword);
  }

  @Get('employee-list')
  getEmployee(@Query('keyword') keyword: string) {
    return this.posService.getEmployee(keyword);
  }

  @Get('services-category')
  getServicesCategory() {
    return this.posService.getCategory();
  }

  @Get('last-trx')
  getLastTransaction() {
    return this.posService.getLastTransaction();
  }
}
