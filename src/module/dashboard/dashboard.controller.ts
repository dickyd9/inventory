import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('general')
  generalReport() {
    return this.dashboardService.generalReport();
  }

  @Get('employeeBest')
  bestEmployee() {
    return this.dashboardService.bestEmployee();
  }

  @Get('transactions')
  getTrasnsactions() {
    return this.dashboardService.lastTransaction();
  }
}
