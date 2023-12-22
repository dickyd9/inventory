import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Services } from '../services/entities/service.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';
import { ServicesCategory } from '../services/entities/service.category.entity';

@Injectable()
export class PosService {
  constructor(
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('ServicesCategory')
    private modelServicesCategory: Model<ServicesCategory>,
  ) {}

  async getMenu(categoryName: string, keyword: any) {
    const query: any = {
      deletedAt: null,
    };

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ servicesName: regex }, { servicesCode: regex }];
    } else if (categoryName) {
      query.servicesCategory = categoryName;
    }
    const services = await this.modelServices
      .find(query)
      .populate('servicesCategory');
    return services;
  }

  async getCustomer() {
    const customer = await this.modelCustomer.find();
    return customer;
  }

  async getEmployee() {
    const employee = await this.modelEmployee.find();
    return employee;
  }

  async getCategory() {
    const query: any = {
      deletedAt: null,
    };

    const category = await this.modelServicesCategory.find(query).exec();
    return category;
  }
}
