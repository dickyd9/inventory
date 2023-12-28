import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Services } from '../services/entities/service.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';
import { ServicesCategory } from '../services/entities/service.category.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { PaymentRelation } from '../transaction/entities/payment-relation';

@Injectable()
export class PosService {
  constructor(
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
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

  async getCustomer(keyword: string) {
    const query: any = {
      deletedAt: null,
    };

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ customerName: regex }];
    }

    const customer = await this.modelCustomer.find(query);
    return customer;
  }

  async getEmployee(keyword: string) {
    const query: any = {
      deletedAt: null,
    };

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ employeeName: regex }];
    }
    const employee = await this.modelEmployee.find(query);
    return employee;
  }

  async getCategory() {
    const query: any = {
      deletedAt: null,
    };

    const category = await this.modelServicesCategory.find(query).exec();
    return category;
  }

  async getLastTransaction() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const trx = await this.modelTransaction
      .find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
      .limit(3);

    const result = [];
    await Promise.all(
      trx.map(async (e: any) => {
        const payment = await this.modelPayment.findOne({
          paymentCode: e.paymentCode,
        });
        const customer = await this.modelCustomer.findOne({
          customerCode: e.customerCode,
        });

        const services = [];
        if (Array.isArray(e.service)) {
          for (const service of e.service) {
            const itm = await this.modelServices.findOne({
              servicesCode: service.serviceCode,
            });

            const serviceResult = {
              servicesName: itm.servicesName,
              servicesPrice: itm.servicesPrice,
              servicesAmount: service.amount,
              servicesPoint: itm.servicesPoint,
              totalPoint: itm.servicesPoint * service.amount,
              totalAmount: service.amount,
              totalPrice: service.amount * itm.servicesPrice,
            };

            services.push(serviceResult);
          }
        }

        if (payment) {
          const detail = {
            invoice: payment?.invoiceCode,
            paymentCode: payment?.paymentCode,
            customerName: customer.customerName,
            totalPrice: e.totalPrice,
            totalPoint: e.totalPoint,
            totalAmount: e.totalAmount,
            paymentMethod: payment.paymentMethod,
            paymentAmount: payment.paymentAmount,
            paymentStatus: payment.paymentStatus,
            changeAmount: payment.changeAmount,
            paymentDate: e?.createdAt,
            services,
          };

          result.push(detail);
        }
      }),
    );

    const sortDate = result.sort((a, b) => b.paymentDate - a.paymentDate);
    return sortDate;
  }
}
