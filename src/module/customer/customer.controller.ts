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
  Put,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ResponseInterceptor } from 'src/common/response/response.interceptor'

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll(@Query('keyword') keyword: any) {
    return this.customerService.findAll(keyword);
  }

  @Get('all')
  posCustomerList(@Query('keyword') keyword: any) {
    return this.customerService.findAll(keyword);
  }

  @Get(':customerCode')
  findOne(@Param('customerCode') customerCode: string) {
    return this.customerService.findOne(customerCode);
  }

  @Put(':customerId')
  update(
    @Param('customerId') customerId: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(customerId, updateCustomerDto);
  }

  @Delete(':customerId')
  remove(@Param('customerId') customerId: string) {
    return this.customerService.remove(customerId);
  }
}
