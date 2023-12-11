import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './entities/customer.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Item } from '../item/entities/item.entity';
import { Services } from '../services/entities/service.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Transaction')
    private modelTransaction: Model<Transaction>,
  ) {}
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const customer = new this.customerModel(createCustomerDto);
    const result = await customer.save();
    return {
      status: HttpStatus.CREATED,
      message: 'Customer added',
      detail: result,
    };
  }

  async findAll(keyword: any) {
    const regexPattern = new RegExp(keyword, 'i');
    const customer = await this.customerModel.find({
      $or: [
        {
          customerName: regexPattern,
        },
        {
          customerContact: regexPattern,
        },
        {
          customerEmail: regexPattern,
        },
      ],
    });
    return customer;
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
