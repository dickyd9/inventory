import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './entities/customer.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Item } from '../item/entities/item.entity';
import { Services } from '../services/entities/service.entity';
import { CustomerPoint } from './entities/customer.point.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('CustomerPoint')
    private modelCustomerPoint: Model<CustomerPoint>,
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Transaction')
    private modelTransaction: Model<Transaction>,
  ) {}
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    try {
      const customer = new this.customerModel(createCustomerDto);
      const result = await customer.save();
      return {
        status: HttpStatus.CREATED,
        message: 'Customer added',
        detail: result,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(keyword: any) {
    const regexPattern = new RegExp(keyword, 'i');
    const customer = await this.customerModel.find({
      // $and: [
      //   {
      //     $or: [
      //       {
      //         customerName: regexPattern,
      //       },
      //       {
      //         customerContact: regexPattern,
      //       },
      //       {
      //         customerEmail: regexPattern,
      //       },
      //     ],
      //   },
      //   {
      //     deletedAt: null,
      //   },
      // ],
      deletedAt: null,
    });

    const customerCode = customer.map((cust) => cust.customerCode);

    const customerPoints = await this.modelCustomerPoint.aggregate([
      {
        $match: {
          customerCode: { $in: customerCode },
        },
      },
      {
        $group: {
          _id: '$customerCode',
          totalPoints: { $sum: { $toInt: '$pointAmount' } },
        },
      },
    ]);

    const enrichedCustomers = customer.map((cust) => {
      const points = customerPoints.find(
        (point) => point._id === cust.customerCode,
      );
      const totalPoints = points ? points.totalPoints : 0;

      return {
        ...cust.toObject(),
        totalPoints,
      };
    });

    return enrichedCustomers;
  }

  async findOne(customerCode: string) {
    const customer = await this.customerModel.findOne({
      customerCode: customerCode,
    });

    const transaction = await this.modelTransaction.find({
      customerCode: customerCode,
    });

    const report = {
      totalTransaction: null,
      totalItem: null,
      totalPoint: null,
      totalPaid: null,
      transaction: [],
    };

    for (const trx of transaction) {
      report.totalTransaction = transaction.length;
      report.totalItem += trx.totalAmount;
      report.totalPoint += trx.totalPoint;
      report.totalPaid += trx.totalPrice;

      const trxRef = {
        transactionRef: trx._id,
        paymenCode: trx.paymentCode,
        totalPoint: trx.totalPoint,
        totalAmount: trx.totalAmount,
        totalPrice: trx.totalPrice,
        service: [],
      };
      for (const service of trx.service) {
        const itm = await this.modelServices.findOne({
          servicesCode: service.serviceCode,
        });
        trxRef.service.push({
          serviceCode: itm.servicesCode,
          serviceName: itm.servicesName,
          servicePrice: itm.servicesPrice,
          servicePoint: itm.servicesPoint,
        });
      }
      report.transaction.push(trxRef);
    }

    const res = {
      ...customer.toObject(),
      report: report,
    };

    return res;
  }

  async update(customerId: string, updateCustomerDto: UpdateCustomerDto) {
    const result = await this.customerModel.findByIdAndUpdate(
      { _id: customerId },
      { updateCustomerDto },
    );
    return {
      message: 'Item Updated!',
      result,
    };
  }

  async remove(customerId: string) {
    const deleted = await this.customerModel.findByIdAndUpdate(
      { _id: customerId },
      { deletedAt: new Date() },
    );
    return {
      message: 'Success delete Item',
      count: 1,
    };
  }
}
