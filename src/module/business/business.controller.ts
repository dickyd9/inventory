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
import { BusinessService } from './business.service';
import {
  CreateBusinessDto,
  OutletDto,
  assignItemDto, 
} from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ResponseInterceptor } from 'src/common/response/response.interceptor'

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.createBusiness(createBusinessDto);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll(
    @Query('businessCode') businessCode: string,
    @Query('keyword') keyword: string,
  ) {
    if (businessCode) {
      return this.businessService.findOne(businessCode);
    } else {
      return this.businessService.findAll(keyword);
    }
  }

  @Patch(':businessCode')
  update(
    @Param('businessCode') businessCode: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    return this.businessService.update(businessCode, updateBusinessDto);
  }

  @Patch('outlet/:businessCode')
  createOutlet(
    @Param('businessCode') businessCode: string,
    @Body() updatedOutlets: OutletDto[],
  ) {
    return this.businessService.updateOutlet(businessCode, updatedOutlets);
  }

  @Patch('assignItem/:businessId')
  assignItem(
    @Param('businessId') businessId: string,
    @Body()
    item: string[],
  ) {
    return this.businessService.assignItem(businessId, item);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.softDelete(id);
  }
}
