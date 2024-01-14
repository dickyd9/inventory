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
import { CreateBookingDto } from './dto/create-transaction.dto';
import { CustomerReport } from '../customer/entities/customer.report.entity';
import { TransactionReport } from './entities/transaction.report';
import {
  BookingTransaction,
  BookingTransactionSchema,
} from './entities/booking-transaction';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('CustomerReport')
    private modelCustomerReport: Model<CustomerReport>,
    @InjectModel('TransactionReport')
    private modelTransactionReport: Model<TransactionReport>,
    @InjectModel('CustomerPoint')
    private modelCustomerPoint: Model<CustomerPoint>,
    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
    @InjectModel('BookingTransaction')
    private modelBookingTransaction: Model<BookingTransaction>,
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
    try {
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
    } catch (error) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async addItem(paymentCode: any, data: any) {
    const math = {
      totalAmount: 0,
      totalPrice: 0,
      totalPoint: 0,
    };

    const itemsData = [];
    for (const item of data?.data) {
      const { itemCode, amount, employeeCode } = item;

      const { itemPoint, itemPrice } = await this.modelItem.findOne({
        itemCode: itemCode,
      });

      itemsData.push({
        itemCode,
        amount,
        itemPoint,
        employeeCode: employeeCode,
      });

      math.totalPoint += itemPoint;

      math.totalPrice += itemPrice * amount;

      math.totalAmount += amount;
    }
    await this.modelTransaction.findOneAndUpdate(
      {
        paymentCode: paymentCode,
      },
      {
        $set: {
          item: itemsData,
          ...math,
        },
      },
    );

    const body = {
      paymentCode: paymentCode,
    };
    const payment = new this.modelPayment(body);

    await payment.save();

    return {
      status: HttpStatus.CREATED,
      message: 'Services Updated',
      paymentCode: paymentCode,
    };
  }

  async updatePaymentStatus(paymentCode: string, payment: any) {
    try {
      const { paymentMethod, paymentPrice } = payment;
      const transaction = await this.modelTransaction.findOne({
        paymentCode,
      });
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

      const items = [];
      if (Array.isArray(transaction.item)) {
        for (const item of transaction.item) {
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

          transaction.item.forEach(async (trx: any) => {
            const itemService = await this.modelItem.findOne({
              itemCode: trx.itemCode,
            });

            if (itemService.itemType == 'product') {
              const item = await this.modelItem.findOne({
                itemCode: trx?.itemCode,
              });

              if (item) {
                await item.updateOne({
                  itemAmount: item.itemAmount - trx.amount,
                });
              }
            }

            const taskemployee = new this.modelEmployeeTaskReport({
              employeeCode: trx.employeeCode,
              transactionRef: trx?.invoiceCode,
              incomeEarn: itemService?.itemPrice,
              itemCode: trx.itemCode,
            });

            const customerPoint = new this.modelCustomerPoint({
              customerCode: transaction.customerCode,
              transactionRef: payments?.invoiceCode,
              spendTransaction: transaction?.totalPrice,
              pointAmount: transaction?.totalPoint,
            });
            await taskemployee.save();
            await customerPoint.save();
          });
        }
      }

      const reportTransaction = new this.modelTransactionReport({
        transactionId: transaction._id,
      });

      const reportCustomer = new this.modelCustomerReport({
        customerId: customer._id,
        transactionId: transaction._id,
      });

      await reportTransaction.save();
      await reportCustomer.save();

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
        items,
      };

      return {
        message: 'Payment Success',
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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

    // const transaction = await this.modelTransaction.findOne({
    //   paymentCode: paymentCode,
    // });

    const transaction = await this.modelTransaction.aggregate([
      {
        $match: {
          paymentCode: paymentCode,
        },
      },

      // Unwind array item agar bisa digabungkan dengan koleksi item
      { $unwind: '$item' },

      // Lookup untuk menggabungkan data dari koleksi item
      {
        $lookup: {
          from: 'items',
          localField: 'item.itemCode',
          foreignField: 'itemCode',
          as: 'matchedItem',
        },
      },

      // Unwind hasil lookup item
      { $unwind: '$matchedItem' },

      // { $match: { 'item.employeeCode': { $ne: '' } } },

      // Lookup untuk menggabungkan data dari koleksi employee
      // {
      //   $lookup: {
      //     from: 'employees',
      //     localField: 'item.employeeCode',
      //     foreignField: 'employeeCode',
      //     as: 'matchedEmployee',
      //   },
      // },

      // // Unwind hasil lookup employee
      // { $unwind: '$matchedEmployee' },

      // // Group kembali data transaksi jika diperlukan
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          paymentCode: { $first: '$paymentCode' },
          customerCode: { $first: '$customerCode' },
          item: { $push: '$item' }, // Jika ingin mengelompokkan kembali item menjadi array
          totalPoint: { $first: '$totalPoint' },
          totalAmount: { $first: '$totalAmount' },
          totalPrice: { $first: '$totalPrice' },
          isDone: { $first: '$isDone' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          __v: { $first: '$__v' },
          matchedItem: { $push: '$matchedItem' }, // Simpan hasil lookup item jika diperlukan
          // matchedEmployee: { $push: '$matchedEmployee' }, // Simpan hasil lookup employee jika diperlukan
          // Sesuaikan dengan kebutuhan lainnya
        },
      },
    ]);

    console.log(transaction);

    // if (!transaction) {
    //   throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    // }

    // return {
    //   ...transaction.toObject(),
    //   ...payment.toObject(),
    // };
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

  // async findOnePayment(transactionId: string, paymentCode: string) {
  //   const payment = await this.modelPayment.findOne({
  //     transactionId,
  //     paymentCode,
  //   });
  //   return payment;
  // }

  // async findOneTrx(paymentCode: string) {
  //   const payment = await this.modelTransaction.findOne({
  //     paymentCode: paymentCode,
  //   });
  //   return payment;
  // }

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

  // Booking Transaction
  async bookingTrx(createBookingDto: CreateBookingDto) {
    try {
      const book = new this.modelBookingTransaction(createBookingDto);
      const result = await book.save();
      return {
        message: 'Success Create Booking!',
        result,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateBooking(bookingId: string, body: any, userId: string) {
    try {
      const book = await this.modelBookingTransaction.findOne({
        _id: bookingId,
      });

      const { customerCode, item } = book;
      if (body?.process == 'proses') {
        const order = await this.createOrder(userId, { customerCode });
        await this.addItem(order.paymentCode, { data: item });
        await book.updateOne({
          status: 'SUCCESS',
        });
      } else {
        await book.updateOne({
          status: 'CANCEL',
        });
      }

      return {
        message: 'Success Update Booking!',
      };
    } catch (error) {
      console.log(error);
    }
  }

  async bookingList() {
    const query: any = {
      deletedAt: null,
    };
    const book = await this.modelBookingTransaction.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerCode',
          foreignField: 'customerCode',
          as: 'customerData',
        },
      },
      {
        $unwind: '$customerData',
      },
    ]);

    return book;
  }
}
