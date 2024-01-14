import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Services } from './entities/service.entity';
import { Model } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { ServicesCategory } from './entities/service.category.entity';
import { Item } from '../item/entities/item.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('ServicesCategory')
    private modelServicesCategory: Model<ServicesCategory>,
  ) {}

  // Service
  async createServices(createServices: CreateServiceDto) {
    const services = new this.modelServices(createServices);
    const result = await services.save();
    return {
      status: 'Success add services',
      count: 1,
      data: {
        name: result.servicesName,
        code: result.servicesCode,
      },
    };
  }

  async assignServicesCat(serviceId: any, category: any) {
    const categories = await this.modelServicesCategory.findOne({
      categoryName: category.categoryName,
    });

    if (!category) {
      throw new HttpException('Category Not Found!', HttpStatus.NOT_FOUND);
    }

    const service = await this.modelServices.findOne({ _id: serviceId });

    const result = await service.updateOne({
      servicesCategory: categories.categoryName,
    });

    return {
      message: `Services assigned for ${category.categoryName}`,
      result,
    };
  }

  async assignServicesItem(
    serviceId: any,
    itemCode: string,
    amountUsage: number,
  ) {
    const service = await this.modelServices.findById({ _id: serviceId });

    const existingItem = service.servicesItem?.find(
      (item) => item.itemCode === itemCode,
    );

    if (existingItem) {
      existingItem.amountUsage += amountUsage;
    }

    const data = {
      itemCode,
      addDate: new Date(),
    };

    const result = await service.save();
    return { message: 'Success add item', result };
  }

  async getAllService(keyword: any, category: string) {
    const query: any = {
      deletedAt: null,
    };

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ servicesName: regex }, { servicesCode: regex }];
    } else if (category) {
      query.servicesCategory = category;
    }

    const services = await this.modelServices.find(query);

    return services;
  }

  async udateServices(serviceId: any, udateServicesDto: UpdateServiceDto) {
    const services = await this.modelServices.findOne({ _id: serviceId });

    const result = await services.updateOne(udateServicesDto);
    return {
      status: 'Success updated services',
      result,
    };
  }

  async deleteService(serviceId: any) {
    const service = await this.modelServices.findOne({ _id: serviceId });

    await service.updateOne({
      deletedAt: new Date(),
    });

    return {
      message: 'Success Delete Data',
      count: 1,
    };
  }

  // Services Category
  async createServicesCategory(
    createServiceCategoryDto: CreateServiceCategoryDto,
  ) {
    try {
      const categoryName = createServiceCategoryDto.categoryName.toLowerCase();
      const category = new this.modelServicesCategory({ categoryName });

      const result = await category.save();

      return { message: 'Category Created!', result };
    } catch (error) {}
    return { message: 'Data Duplicate!' };
  }

  async getServicesCategory() {
    const query: any = {
      deletedAt: null,
    };

    const category = await this.modelServicesCategory.find(query).exec();

    const result = [];
    await Promise.all(
      category.map(async (cat: any) => {
        const services = await this.modelItem.find({
          servicesCategory: cat.categoryName,
        });
        const serviceCategory = {
          _id: cat._id,
          categoryCode: cat.categoryCode,
          categoryName: cat.categoryName,
          totalService: services.length,
        };

        result.push(serviceCategory);
      }),
    );

    return result;
  }

  async udateServicesCategory(
    servicesCategoryId: any,
    createServiceCategoryDto: CreateServiceCategoryDto,
  ) {
    const servicesCategory = await this.modelServicesCategory.findOne({
      _id: servicesCategoryId,
    });

    const result = await servicesCategory.updateOne(createServiceCategoryDto);
    return {
      message: 'Success updated services category',
      result,
    };
  }

  async deleteServiceCategory(servicesCategoryCodeId: any) {
    const serviceCategory = await this.modelServicesCategory.findOne({
      _id: servicesCategoryCodeId,
    });

    const result = await serviceCategory.updateOne({
      deletedAt: new Date(),
    });

    return {
      message: 'Data Deleted!',
      result,
    };
  }
}
