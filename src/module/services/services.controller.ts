import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ResponseInterceptor } from 'src/common/response/response.interceptor';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async createService(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.createServices(createServiceDto);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  async getAllService(
    @Query('keyword') keyword: any,
    @Query('category') category: any,
  ) {
    return this.servicesService.getAllService(keyword, category);
  }

  @Put('/:serviceId')
  async editService(
    @Param('serviceId') serviceId: any,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.udateServices(serviceId, updateServiceDto);
  }

  @Put('assign-category/:serviceId')
  async assignCategory(
    @Param('serviceId') serviceId: any,
    @Body() category: { categoryName: string },
  ) {
    return this.servicesService.assignServicesCat(serviceId, category);
  }

  @Put('assign-item/:serviceId')
  async assignItem(
    @Param('serviceId') serviceId: any,
    @Body() itemCode: string,
    @Body() amountUsage: number,
  ) {
    return this.servicesService.assignServicesItem(
      serviceId,
      itemCode,
      amountUsage,
    );
  }

  @Delete('/:serviceId')
  async deleteService(@Param('serviceId') serviceId: any) {
    return this.servicesService.deleteService(serviceId);
  }

  /** Service Category **/
  @Post('category')
  async createServiceCategory(
    @Body() createServiceCategoryDto: CreateServiceCategoryDto,
  ) {
    return this.servicesService.createServicesCategory(
      createServiceCategoryDto,
    );
  }

  @Get('category')
  @UseInterceptors(ResponseInterceptor)
  async getAllServiceCategory() {
    return this.servicesService.getServicesCategory();
  }

  @Put('category/:serviceCategoryId')
  async editServiceCategory(
    @Param('serviceCategoryId') serviceCategoryId: any,
    @Body() updateServiceCategoryDto: CreateServiceCategoryDto,
  ) {
    return this.servicesService.udateServicesCategory(
      serviceCategoryId,
      updateServiceCategoryDto,
    );
  }

  @Delete('category/:serviceCategoryId')
  async deleteServiceCategory(
    @Param('serviceCategoryId') serviceCategoryId: any,
  ) {
    return this.servicesService.deleteServiceCategory(serviceCategoryId);
  }
}
