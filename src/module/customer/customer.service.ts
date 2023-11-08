import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './entities/customer.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Item } from '../item/entities/item.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('Item') private modelItem: Model<Item>,
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
        item: [],
      };
      for (const item of trx.item) {
        const itm = await this.modelItem.findOne({ itemCode: item.itemCode });
        trxRef.item.push({
          itemCode: itm.itemCode,
          itemName: itm.itemName,
          itemPrice: itm.itemPrice,
          itemPoint: itm.itemPoint,
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

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = new this.customerModel(updateCustomerDto);
    const result = await customer.updateOne();
    return result;
  }

  async remove(id: string) {
    const deleted = await this.customerModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .exec();
    return deleted;
  }
}
