import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResponseInterceptor } from 'src/common/response/response.interceptor';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createEmployeeDto);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll(@Query('keyword') keyword: string) {
    return this.employeeService.findAll(keyword);
  }

  @Get(':code')
  findOne(
    @Param('code') code: string,
    @Query('day')
    day: any,
    @Query('month')
    month: any,
    @Query('year')
    year: any,
  ) {
    return this.employeeService.findOne(code, day, month, year);
  }

  // @Get('task/:employeeCode')
  // findTask(@Param('employeeCode') employeeCode: string) {
  //   return this.employeeService.employeeTask(employeeCode);
  // }

  @Post('assignTask/:itemCode')
  assignTask(
    @Param('itemCode') itemCode: string,
    @Body()
    employee: string[],
  ) {
    return this.employeeService.asignTask(itemCode, employee);
  }

  @Patch(':employeeCode')
  update(
    @Param('employeeCode') employeeCode: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(employeeCode, updateEmployeeDto);
  }

  @Delete(':employeeCode')
  remove(@Param('employeeCode') employeeCode: string) {
    return this.employeeService.remove(employeeCode);
  }
}
