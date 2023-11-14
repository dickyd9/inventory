import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentRelation } from './entities/payment-relation';
import { CustomerPoint } from '../customer/entities/customer.point.entity';
import { EmployeeTaskReport } from '../employee/entities/employee.task.report';
import { Employee } from '../employee/entities/employee.entity';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
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

  // Transaction Proccess

  async createOrder(userId: string, userCode: any) {
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

  async addItem(paymentCode: any, items: any) {
    const math = {
      totalAmount: 0,
      totalPrice: 0,
      totalPoint: 0,
    };

    const itemsData = [];

    if (Array.isArray(items.item)) {
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
    }

    const transaction = {
      item: itemsData,
      ...math,
    };

    const trx = await this.modelTransaction.findOne({
      paymentCode: paymentCode,
    });

    if (trx) {
      await trx.updateOne(transaction);

      const body = {
        paymentCode: paymentCode,
      };
      const payment = new this.modelPayment(body);

      await payment.save();

      return {
        status: HttpStatus.CREATED,
        message: 'Item Updated',
        paymentCode: paymentCode,
        itemAmount: items.length,
      };
    }
  }

  // async updatePaymentMethod(payments: any) {
  //   const { paymentCode, paymentMethod } = payments;
  //   try {
  //     const trx = await this.modelTransaction.findOne({
  //       paymentCode: paymentCode,
  //     });
  //     if (paymentMethod === 'CASH') {
  //       const body = {
  //         paymentCode: paymentCode,
  //         paymentMethod: paymentMethod,
  //         paymentStatus: 'SELECTING_PAYMENT',
  //       };
  //       const payment = new this.modelPayment(body);
  //       const result = await payment.save();
  //       return result;
  //     } else {
  //       const body = {
  //         paymentCode: paymentCode,
  //         paymentMethod: paymentMethod,
  //         paymentStatus: 'SELECTING_PAYMENT',
  //       };
  //       const payment = new this.modelPayment(body);
  //       const result = await payment.save();
  //       return result;
  //     }
  //   } catch (error) {}
  // }

  async updatePaymentStatus(payment: any) {
    const { paymentCode, paymentMethod, paymentPrice } = payment;
    try {
      const transaction = await this.modelTransaction.findOne({
        paymentCode,
      });

      let paymentAmount = transaction.totalPrice;
      let changeAmount = 0;

      if (paymentPrice != 0) {
        paymentAmount = paymentPrice;
        changeAmount = paymentPrice - transaction.totalPrice;
      }

      const payments = {
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod,
        totalPrice: transaction.totalPrice,
        paymentAmount: paymentAmount,
        changeAmount: changeAmount,
      };

      if (paymentPrice < transaction.totalPrice) {
        throw new HttpException(
          'Harga tidak boleh melebihi total transaksi',
          HttpStatus.BAD_REQUEST,
        );
      }

      const payment = await this.modelPayment.findOne({
        paymentCode: paymentCode,
      });
      const result = await payment.updateOne(payments);

      return result;
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

  async getLastTransaction() {
    const trx = await this.modelTransaction.find();

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
            const itm = await this.modelItem.findOne({
              itemCode: item.itemCode,
            });

            const itemResult = {
              itemName: itm.itemName,
              itemPrice: itm.itemPrice,
              itemAmount: item.amount,
              itemPoint: itm.itemPoint,
              totalPoint: itm.itemPoint * item.amount,
              totalAmount: item.amount,
              totalPrice: item.amount * itm.itemPrice,
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
            totalAmount: e.totalAmount,
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.paymentStatus,
            paymentDate: e?.createdAt,
            items,
          };

          result.push(detail);
        }
      }),
    );

    return result;
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
