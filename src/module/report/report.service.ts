import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
  ) {}

  async reportTransaction(report: string, month: any, year: any) {
    const query: any = {};

    // if (day && month && year) {
    //   const awalBulan = new Date(year, month - 1, day);
    //   const akhirBulan = new Date(year, month - 1, day, 23, 59, 59, 999);
    //   query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    // } else if (month && year) {
    //   const awalBulan = new Date(year, month - 1, 1);
    //   const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
    //   query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    // }

    const reports = {
      totalPrice: null,
      totalPoint: null,
      totalTransaction: null,
      report: report,
      transaction: null,
    };
    if (report === 'Bulanan' && month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };

      // const transaction = await this.modelTransaction.find(query);
      const transaction = await this.modelTransaction.aggregate([
        {
          $lookup: {
            from: 'customers', // Nama koleksi customer
            localField: 'customerCode', // Field di koleksi transaksi
            foreignField: 'customerCode', // Field di koleksi customer
            as: 'customerData', // Nama field untuk data customer yang akan di-lookup
          },
        },
        {
          $unwind: '$customerData',
        },
        {
          $project: {
            customerName: '$customerData.customerName',
          },
        },
        {
          $match: query,
        },
      ]);
      reports.totalTransaction = transaction.length;
      reports.transaction = transaction;

      for (const trx of transaction) {
        reports.totalPrice += trx.totalPrice;
        reports.totalPoint += trx.totalPoint;
      }
    } else {
      throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (!reports.transaction.length) {
      throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    return reports;
  }

  async reportService(report: string, month: any, year: any, itemCode: any) {
    const query: any = {};

    const reports = {
      totaltem: null,
      transactionItem: null,
      report: report,
      serviceName: itemCode ? itemCode : 'all',
      service: null,
    };
    if (report === 'Bulanan' && month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };

      if (itemCode) {
        query.itemCode = itemCode;
      }

      const transaction = await this.modelTransaction.find(query);
      const service = await this.modelItem.find(query);
      reports.totaltem = service.length;
      // reports.transaction = transaction;

      // for (const trx of transaction) {
      //   reports.totalPrice += trx.totalPrice;
      //   reports.totalPoint += trx.totalPoint;
      // }
    } else {
      throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    // if (!reports.transaction.length) {
    //   throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    // }

    return reports;
  }
}
