import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Services } from '../services/entities/service.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class PosService {
  constructor(
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
  ) {}

  async getMenu(categoryName: string, keyword: any) {
    const regexPattern = new RegExp(keyword, 'i');
    const services = await this.modelServices
      .find({ servicesCategory: categoryName, servicesName: regexPattern })
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
}
