import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('transaction')
  transactionReport(
    @Query('report')
    report: any,
    @Query('day')
    day: any,
    @Query('month')
    month: any,
    @Query('year')
    year: any,
  ) {
    return this.reportService.reportTransaction(report, month, year);
  }

  @Get('service')
  serviceReport(
    @Query('report')
    report: any,
    @Query('day')
    day: any,
    @Query('month')
    month: any,
    @Query('year')
    year: any,
  ) {
    return this.reportService.reportTransaction(report, month, year);
  }
}
