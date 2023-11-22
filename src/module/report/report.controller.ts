import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateExpenses } from './dto/create-expenses.dto';
import { ResponseInterceptor } from 'src/common/response/response.interceptor';

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

  @Post('expenses')
  createExpenses(@Body() createExpenses: CreateExpenses) {
    return this.reportService.addExpenses(createExpenses);
  }

  @Get('expenses')
  @UseInterceptors(ResponseInterceptor)
  getExpenses(
    @Query('month')
    month: any,
    @Query('year')
    year: any,
  ) {
    return this.reportService.getExpenses(month, year);
  }

  @Get('income')
  getTotalIncome(
    @Query('startDate')
    startDate: any,
    @Query('endDate')
    endDate: any,
    @Query('month')
    month: any,
    @Query('year')
    year: any,
  ) {
    return this.reportService.getLaporanPendapatan(
      startDate,
      endDate,
      month,
      year,
    );
  }
}
