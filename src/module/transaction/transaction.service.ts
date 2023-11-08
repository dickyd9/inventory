import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentRelation } from './entities/payment-relation';
import { CustomerPoint } from '../customer/entities/customer.point.entity';
import { EmployeeTaskReport } from '../employee/entities/employee.task.report';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,
    @InjectModel('CustomerPoint')
    private modelCustomerPoint: Model<CustomerPoint>,
    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
  ) {}

  async checkItemStatusAndAvailability(itemCode: string, amount: number) {
    const item = await this.modelItem.findOne({ itemCode: itemCode });
    if (!item) {
      throw new HttpException(
        {
          message: 'Ada item yang tidak ditemukan!',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Cek ketersediaan jumlah item
    if (item.itemAmount < amount) {
      throw new HttpException(
        {
          message: 'Ada item yang jumlahnya tidak mencukupi!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTicket(userId: string, userCode: any) {
    const { customerCode } = userCode;
    const ticketTransaction = {
      customerCode,
      userId,
    };

    const trx = new this.modelTransaction(ticketTransaction);
    const result = await trx.save();

    return {
      status: HttpStatus.CREATED,
      message: 'Transaction Added',
      paymentCode: result.paymentCode,
    };
  }

  async createTransaction(paymentCode: any, items: any) {
    const math = {
      totalAmount: 0,
      totalPrice: 0,
      totalPoint: 0,
    };

    const itemsData = [];

    for (const item of items.data) {
      const { itemCode, amount, employeeCode } = item;
      const { itemPoint, itemPrice } = await this.modelItem.findOne({
        itemCode: itemCode,
      });

      itemsData.push({
        itemCode,
        amount,
        itemPoint,
        employeeCode,
      });

      math.totalPoint += itemPoint;

      math.totalPrice += itemPrice * amount;

      math.totalAmount += amount;
    }

    const transaction = {
      item: itemsData,
      ...math,
    };

    const trx = await this.modelTransaction.findOne({
      paymentCode: paymentCode,
    });

    await trx.updateOne(transaction);

    return {
      status: HttpStatus.CREATED,
      message: 'Item Updated',
      paymentCode: paymentCode,
      itemAmount: items.length,
    };
  }

  private async createPayment(
    paymentCode: string,
    paymentMethod: string,
    paymentPrice: number,
  ) {
    try {
      const trx = await this.modelTransaction.findOne({
        paymentCode: paymentCode,
      });
      if (paymentMethod === 'CASH') {
        const changeAmount = trx.totalAmount - paymentPrice;
        const body = {
          paymentCode: paymentCode,
          paymentMethod: paymentMethod,
          paymentAmount: paymentPrice,
          changeAmount: changeAmount,
          paymentStatus: 'SELECTING_PAYMENT',
        };
        const payment = new this.modelPayment(body);
        const result = await payment.save();
        return result;
      } else {
        const body = {
          paymentCode: paymentCode,
          paymentMethod: paymentMethod,
          paymentAmount: paymentPrice,
          changeAmount: 0,
          paymentStatus: 'SELECTING_PAYMENT',
        };
        const payment = new this.modelPayment(body);
        const result = await payment.save();
        return result;
      }
    } catch (error) {}
  }

  async checkTransactionStatus(
    transactionId: string,
    paymentCode: string,
  ): Promise<any> {
    const status = await this.modelPayment
      .findOne({ transactionId, paymentCode })
      .exec();
    return status;
  }

  async markTransactionAsExpired(
    transactionId: string,
    paymentCode: string,
  ): Promise<any> {
    const payment = await this.modelPayment.findOne({
      transactionId,
      paymentCode,
    });

    if (payment.expiredDate >= new Date()) {
      const result = await this.modelPayment
        .findOneAndUpdate(
          { transactionId, paymentCode },
          { paymentStatus: 'EXPIRED' },
          { new: true },
        )
        .exec();
      return result;
    }

    // if (payment.paymentStatus !== 'CANCELED') {
    //   const result = await this.modelPayment
    //     .findOneAndUpdate(
    //       { transactionId, paymentCode },
    //       { paymentStatus: 'EXPIRED' },
    //       { new: true },
    //     )
    //     .exec();
    //   return result;
    // }
  }

  async updatePaymentMethod(payments: any) {
    const { paymentCode, paymentMethod, paymentPrice } = payments;
    const payment = await this.modelPayment.findOne({
      paymentCode: paymentCode,
    });

    await this.createPayment(paymentCode, paymentMethod, paymentPrice);

    return {
      status: '201',
      message: 'Payment Created',
      data: {
        paymentCode: paymentCode,
        paymentMethod: paymentMethod,
        paymentPrice: paymentPrice,
      },
    };
  }

  async updatePaymentStatus(payment: any) {
    try {
      const { paymentCode, paymentStatus } = payment;

      const payments = await this.modelPayment
        .findOneAndUpdate(
          { paymentCode },
          { paymentStatus: paymentStatus },
          { new: true },
        )
        .exec();

      const transaction = await this.modelTransaction.findOne({
        paymentCode,
      });

      if (paymentStatus === 'PAID') {
        const point = {
          customerCode: transaction.customerCode,
          transactionRef: transaction.paymentCode,
          pointAmount: transaction.totalPoint,
        };

        const customerPoint = new this.modelCustomerPoint(point);
        await customerPoint.save();

        for (const item of transaction.item) {
          const employeeTask = {
            employeeCode: item.employeeCode,
            transactionRef: transaction._id,
            serviceCode: item.itemCode,
          };

          const employee = new this.modelEmployeeTaskReport(employeeTask);
          await employee.save();
        }
      }

      return payments;
    } catch (error) {}
  }

  async checkPaymentStatus(
    transactionId: string,
    paymentCode: string,
  ): Promise<string> {
    const transaction = await this.modelPayment.findOne({
      transactionId,
      paymentCode,
    });

    if (!transaction) {
      return 'Transaction not found';
    }

    if (transaction.paymentStatus === 'EXPIRED') {
      return 'Transaction has expired';
    }

    return transaction.paymentStatus;
  }

  async getPaymentDetail(paymentCode: string) {
    const payment = await this.modelPayment.findOne({
      paymentCode: paymentCode,
    });

    const transaction = await this.modelTransaction.findOne({
      paymentCode: paymentCode,
    });

    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    return {
      ...transaction.toObject(),
      ...payment.toObject(),
    };
  }

  async findAll(day: any, month: any, year: any) {
    const query: any = {};

    if (day && month && year) {
      const awalBulan = new Date(year, month - 1, day);
      const akhirBulan = new Date(year, month - 1, day, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    } else if (month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    }
    const transaction = await this.modelTransaction.find(query);
    return transaction;
  }

  async findExpiredTransactions() {
    const payment = await this.modelPayment.find();
    return payment;
  }

  async findOnePayment(transactionId: string, paymentCode: string) {
    const payment = await this.modelPayment.findOne({
      transactionId,
      paymentCode,
    });
    return payment;
  }

  async findOneTrx(paymentCode: string) {
    const payment = await this.modelTransaction.findOne({
      paymentCode: paymentCode,
    });
    return payment;
  }
}
