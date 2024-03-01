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

  async findAll(keyword: any, month: number, year: number) {
    try {
      const query: any = {
        deletedAt: null,
      };

      if (month && year) {
        const awalBulan = new Date(year, month - 1, 1);
        const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
        query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
      }

      if (keyword) {
        const regexPattern = new RegExp(keyword, 'i');

        query.$or = [
          { customerName: { $regex: regexPattern } },
          { customerEmail: { $regex: regexPattern } },
        ];
      }
      const listCustomer = await this.customerModel.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'customerpoints',
            localField: 'customerCode',
            foreignField: 'customerCode',
            as: 'transactionRef',
          },
        },
        {
          $addFields: {
            totalPoint: {
              $sum: {
                $map: {
                  input: '$transactionRef',
                  as: 'trx',
                  in: '$$trx.pointAmount',
                },
              },
            },
            totalSpent: {
              $sum: {
                $map: {
                  input: '$transactionRef',
                  as: 'trx',
                  in: '$$trx.spendTransaction',
                },
              },
            },
          },
        },
        {
          $project: {
            transactionRef: 0,
            __v: 0,
          },
        },
      ]);

      return listCustomer;
    } catch (error) {}
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
      if (trx.item) {
        for (const service of trx.item) {
          const itm = await this.modelItem.findOne({
            itemCode: service.itemCode,
          });
          trxRef.item.push({
            itemCode: itm.itemCode,
            itemName: itm.itemName,
            itemPrice: itm.itemPrice,
            itemPoint: itm.itemPoint,
          });
        }
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
