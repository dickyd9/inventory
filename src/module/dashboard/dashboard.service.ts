import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Customer } from '../customer/entities/customer.entity';
import { PaymentRelation } from '../transaction/entities/payment-relation';
import { Employee } from '../employee/entities/employee.entity';
import { ReportService } from '../report/report.service';
import { EmployeeTaskReport } from '../employee/entities/employee.task.report';
import { Services } from '../services/entities/service.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,

    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
  ) {}

  async generalReport() {
    const items = await this.modelItem.find({ deletedAt: null });
    const services = await this.modelServices.find({ deletedAt: null });
    const customers = await this.modelCustomer.find({ deletedAt: null });
    const employees = await this.modelEmployee.find({ deletedAt: null });
    const payments = await this.modelPayment.find({
      paymentStatus: 'PAID',
      deletedAt: null,
    });

    const result = [
      {
        icon: 'ShoppingCart',
        title: 'Transaksi',
        key: 'transactionReport',
        data: payments.length,
        link: '/transaction-report',
      },
      {
        icon: 'Monitor',
        title: 'Jasa',
        key: 'servicesReport',
        data: services.length,
        link: '/itemService',
      },
      {
        icon: 'User',
        title: 'Pelanggan',
        key: 'customerReport',
        data: customers.length,
        link: '/list-customer',
      },
      {
        icon: 'User',
        title: 'Karyawan',
        key: 'employeeReport',
        data: employees.length,
        link: '/list-employee',
      },
    ];

    return result;
  }

  async bestEmployee() {
    const employee = await this.modelEmployee.find();
    const best = [];

    const employeeTask = await this.modelEmployeeTaskReport.aggregate([
      {
        $group: {
          _id: '$employeeCode',
          employeeCode: { $first: '$employeeCode' },
          employeeTaskUsed: { $sum: 1 },
          incomeEarn: { $sum: '$incomeEarn' },
        },
      },
      {
        $lookup: {
          from: 'employees', // Nama koleksi Employee
          localField: '_id', // Field dari modelEmployeeTaskReport (employeeId)
          foreignField: 'employeeCode', // Field dari koleksi Employee
          as: 'employeeData', // Nama field untuk hasil join
        },
      },
      {
        $unwind: '$employeeData', // Mengurai array hasil join
      },
      {
        $project: {
          _id: 0,
          employeeName: '$employeeData.employeeName',
          employeeCode: '$employeeData.employeeCode',
          employeeTaskUsed: 1,
          incomeEarn: 1,
        },
      },
    ]);
    const result = employeeTask.filter((b) => b.employeeTaskUsed != 0);
    return result;
  }

  async lastTransaction() {
    const trx = await this.modelTransaction
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        'paymentCode customerCode createdAt totalPrice totalAmount totalPoint',
      );

    const result = [];
    await Promise.all(
      trx.map(async (e: any) => {
        const payment = await this.modelPayment.findOne({
          paymentCode: e.paymentCode,
        });

        const customer = await this.modelCustomer.findOne({
          customerCode: e?.customerCode,
        });

        if (payment) {
          const detail = {
            invoice: payment?.invoiceCode,
            paymentCode: payment?.paymentCode,
            customerName: customer.customerName,
            totalPrice: e.totalPrice,
            totalPoint: e.totalPoint,
            paymentDate: e?.createdAt,
          };

          result.push(detail);
        }
      }),
    );

    return result;
  }
}
