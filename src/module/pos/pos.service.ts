import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Services } from '../services/entities/service.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';
import { ServicesCategory } from '../services/entities/service.category.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { PaymentRelation } from '../transaction/entities/payment-relation';
import { Item } from '../item/entities/item.entity';

@Injectable()
export class PosService {
  constructor(
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Item') private modelItem: Model<Item>,
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
      query.$or = [{ itemName: regex }, { itemCode: regex }];
    } else if (categoryName) {
      query.itemCategory = new mongoose.Types.ObjectId(categoryName);
    }

    const item = await this.modelItem.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'itemcategories',
          localField: 'itemCategory',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryData.categoryName', 0] },
        },
      },
      {
        $project: {
          categoryData: 0,
          itemCategory: 0,
        },
      },
      {
        $group: {
          _id: '$categoryName',
          data: { $push: '$$ROOT' },
        },
      },
    ]);

    const categorizedData = item.reduce((accumulator, service) => {
      const categoryKey = service._id || 'nullOrEmpty'; // Menggunakan 'nullOrEmpty' jika _id adalah null atau ""
      if (categoryKey in accumulator) {
        accumulator[categoryKey].push(...service.data);
      } else {
        accumulator[categoryKey] = service.data || [];
      }
      return accumulator;
    }, {});

    const formattedResult = Object.keys(categorizedData).map((categoryKey) => {
      return {
        categoryName: categoryKey === 'nullOrEmpty' ? 'All' : categoryKey,
        services: categorizedData[categoryKey],
      };
    });

    return formattedResult;
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
    const trx = await this.modelTransaction.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    // .limit(5);

    const result = [];
    await Promise.all(
      trx.map(async (e: any) => {
        const payment = await this.modelPayment.findOne({
          paymentCode: e.paymentCode,
        });
        const customer = await this.modelCustomer.findOne({
          customerCode: e.customerCode,
        });

        const items = [];
        if (Array.isArray(e.item)) {
          for (const item of e.item) {
            const model = await this.modelItem.findOne({
              itemCode: item.itemCode,
            });

            const itemResult = {
              itemName: model.itemName,
              itemPrice: model.itemPrice,
              itemAmount: item.amount,
              itemPoint: model.itemPoint,
              totalPoint: model.itemPoint * item.amount,
              totalAmount: item.amount,
              totalPrice: item.amount * model.itemPrice,
            };

            items.push(itemResult);
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
            items,
          };

          result.push(detail);
        }
      }),
    );

    const sortDate = result.sort((a, b) => b.paymentDate - a.paymentDate);
    return sortDate;
  }
}
