import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  @UseInterceptors(ResponseInterceptor)
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
    @Query('keyword') keyword: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('sortColumn') sortColumn: string,
    @Query('sortDirection') sortDirection: string,
  ) {
    return this.reportService.reportService(
      month,
      year,
      sortColumn,
      sortDirection,
    );
  }

  @Get('employee')
  employeeReport(
    @Query('keyword') keyword: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('sortColumn') sortColumn: string,
    @Query('sortDirection') sortDirection: string,
  ) {
    return this.reportService.reportEmployee(
      month,
      year,
      sortColumn,
      sortDirection,
    );
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

  @Delete('expenses/:expensesId')
  deletedExpenses(@Param('expensesId') expensesId: string) {
    return this.reportService.deleteExpenses(expensesId);
  }

  @Get('info')
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
    return this.reportService.getReport(startDate, endDate, month, year);
  }
}
