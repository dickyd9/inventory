import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Customer } from '../customer/entities/customer.entity';
import { PaymentRelation } from '../transaction/entities/payment-relation';
import { Employee } from '../employee/entities/employee.entity';
import { ReportService } from '../report/report.service';
import { EmployeeTaskReport } from '../employee/entities/employee.task.report';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,

    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
  ) {}

  async generalReport() {
    const items = await this.modelItem.find();
    const customers = await this.modelCustomer.find();
    const employees = await this.modelCustomer.find();
    const payments = await this.modelPayment.find({
      paymentStatus: 'PAID',
    });

    const result = [
      {
        icon: 'ShoppingCart',
        title: 'Transaksi',
        key: 'transactionReport',
        data: payments.length,
      },
      {
        icon: 'Monitor',
        title: 'Jasa',
        key: 'itemsReport',
        data: items.length,
      },
      {
        icon: 'User',
        title: 'Pelanggan',
        key: 'customerReport',
        data: customers.length,
      },
      {
        icon: 'User',
        title: 'Karyawan',
        key: 'employeeReport',
        data: employees.length,
      },
    ];

    return result;
  }

  async bestEmployee() {
    const employee = await this.modelEmployee.find();
    const best = [];

    await Promise.all(
      employee.map(async (e) => {
        const employeeTask = await this.modelEmployeeTaskReport.find({
          employeeCode: e.employeeCode,
        });

        if (employeeTask) {
          const taskCount = employeeTask.length;
          const detail = {
            employeeCode: e.employeeCode,
            employeeName: e.employeeName,
            employeeTaskHandle: taskCount,
          };

          best.push(detail);
        }
      }),
    );

    return best;
  }
}
