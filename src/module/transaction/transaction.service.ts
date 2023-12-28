import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentRelation } from './entities/payment-relation';
import { CustomerPoint } from '../customer/entities/customer.point.entity';
import { EmployeeTaskReport } from '../employee/entities/employee.task.report';
import { Employee } from '../employee/entities/employee.entity';
import { Customer } from '../customer/entities/customer.entity';
import { StorageService } from 'src/common/storage/storage.service';
import { StorageFile } from 'src/common/storage/storage.file';
import { Services } from '../services/entities/service.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('CustomerPoint')
    private modelCustomerPoint: Model<CustomerPoint>,
    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
    private readonly storageService: StorageService,
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

    const customer = await this.modelCustomer.findOne({
      customerCode: customerCode,
    });

    const trx = new this.modelTransaction(ticketTransaction);
    const result = await trx.save();

    return {
      status: HttpStatus.CREATED,
      message: 'Transaction Added',
      paymentCode: result.paymentCode,
      customerName: customer.customerName,
      trasactionDate: result.createdAt,
    };
  }

  async addItem(paymentCode: any, services: any) {
    const math = {
      totalAmount: 0,
      totalPrice: 0,
      totalPoint: 0,
    };

    const servicesData = [];

    for (const service of services?.data) {
      const { serviceCode, amount, employeeCode } = service;
      const { servicesPoint, servicesPrice } = await this.modelServices.findOne(
        {
          servicesCode: serviceCode,
        },
      );

      servicesData.push({
        serviceCode,
        amount,
        servicesPoint,
        employeeCode,
      });

      math.totalPoint += servicesPoint;

      math.totalPrice += servicesPrice * amount;

      math.totalAmount += amount;
    }

    const transaction = {
      service: servicesData,
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
        message: 'Services Updated',
        paymentCode: paymentCode,
        serviceAmount: services.length,
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

  async updatePaymentStatus(paymentCode: string, payment: any) {
    const { paymentMethod, paymentPrice } = payment;
    const transaction = await this.modelTransaction.findOne({
      paymentCode,
    });
    try {
      let paymentAmount = paymentPrice;
      let changeAmount = paymentPrice - transaction.totalPrice;

      if (paymentMethod === 'DEBIT' || paymentMethod === 'TRANSFER') {
        paymentAmount = transaction.totalPrice;
        changeAmount = 0;
      }

      await this.modelPayment.updateOne(
        {
          paymentCode: paymentCode,
        },
        {
          $set: {
            paymentStatus: 'PAID',
            paymentMethod: paymentMethod,
            totalPrice: transaction.totalPrice,
            paymentAmount: paymentAmount,
            changeAmount: changeAmount,
          },
        },
        {
          new: true,
        },
      );

      const payments = await this.modelPayment.findOne({
        paymentCode: paymentCode,
      });

      const customer = await this.modelCustomer.findOne({
        customerCode: transaction.customerCode,
      });

      const services = [];
      if (Array.isArray(transaction.service)) {
        for (const service of transaction.service) {
          const itm = await this.modelServices.findOne({
            servicesCode: service.serviceCode,
          });

          const serviceResult = {
            serviceName: itm.servicesName,
            servicePrice: itm.servicesPrice,
            serviceAmount: service.amount,
            servicePoint: itm.servicesPoint,
            totalPoint: itm.servicesPoint * service.amount,
            totalAmount: service.amount,
            totalPrice: service.amount * itm.servicesPrice,
          };

          services.push(serviceResult);
        }
      }

      transaction.service.forEach(async (trx: any) => {
        const taskemployee = new this.modelEmployeeTaskReport({
          employeeCode: trx.employeeCode,
          transactionRef: payments?.invoiceCode,
          serviceCode: trx.serviceCode,
        });

        const customerPoint = new this.modelCustomerPoint({
          customerCode: transaction.customerCode,
          transactionRef: payments?.invoiceCode,
          pointAmount: transaction?.totalPoint,
        });

        await taskemployee.save();
        await customerPoint.save();
      });

      const data = {
        invoice: payments?.invoiceCode,
        paymentCode: paymentCode,
        customerName: customer.customerName,
        totalPrice: transaction?.totalPrice,
        totalPoint: transaction?.totalPoint,
        totalAmount: transaction?.totalAmount,
        paymentMethod: payments.paymentMethod,
        paymentAmount: paymentAmount,
        paymentStatus: payments.paymentStatus,
        changeAmount: changeAmount,
        paymentDate: transaction?.createdAt,
        services,
      };

      return {
        message: 'Payment Success',
        data,
      };
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
              servicesCode: service.servicesCode,
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

  async saveInvoice(file: any, paymentCode: string) {
    try {
      const pathFile = 'dev/' + file.originalname;
      await this.storageService.save(pathFile, file.mimetype, file.buffer, [
        { mediaId: file.originalname },
      ]);

      await this.modelPayment.findOneAndUpdate(
        {
          paymentCode: paymentCode,
        },
        {
          receiptPath: file.originalname,
        },
        {
          new: true,
        },
      );

      return { message: 'File berhasil disimpan', filename: file.originalname };
    } catch (error) {
      return { message: 'Gagal menyimpan file', error: error.message };
    }
  }

  async getInvoice(res: any, paymentCode: any) {
    let storageFile: StorageFile;
    const payment = await this.modelPayment.findOne({
      paymentCode: paymentCode,
    });
    try {
      storageFile = await this.storageService.get('dev/' + payment.receiptPath);
    } catch (e) {
      if (e.message.toString().includes('No such object')) {
        throw new NotFoundException('image not found');
      } else {
        throw new ServiceUnavailableException('internal error');
      }
    }
    if (storageFile && storageFile.contentType) {
      res.setHeader('Content-Type', storageFile.contentType);
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${payment.receiptPath}"`,
    );
    res.setHeader('Cache-Control', 'max-age=60d');
    res.end(storageFile.buffer);
  }
}
