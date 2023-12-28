import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Employee } from '../employee/entities/employee.entity';
import { CreateExpenses } from './dto/create-expenses.dto';
import { Expenses } from './entities/expense.entity';
import { PaymentRelation } from '../transaction/entities/payment-relation';
import { Customer } from '../customer/entities/customer.entity';
import { ItemService } from '../item/item.service';
import { EmployeeTask } from '../employee/entities/employee.task'

@Injectable()
export class ReportService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTask') private modelEmployeeTask: Model<EmployeeTask>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('Expenses') private modelExpenses: Model<Expenses>,
    private readonly itemService: ItemService,
  ) {}

  async reportTransaction(report: any, month: any, year: any) {
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
              // itemPoint: itm.itemPoint,
              // totalPoint: itm.itemPoint * item.amount,
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
            totalItem: items.length,
          };

          result.push(detail);
        }
      }),
    );

    const sortDate = result.sort((a, b) => b.paymentDate - a.paymentDate);
    return sortDate;
  }

  async reportService(
    month: any,
    year: any,
    sortColumn: string,
    sortDirection: string,
  ) {
    const query: any = {};

    if (month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    } else {
      throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const result = await this.modelTransaction.aggregate([
      {
        $match: query,
      },
      { $unwind: '$item' },
      {
        $group: {
          _id: '$item.itemCode',
          itemName: { $first: '$item.itemName' },
          amountUsed: { $sum: '$item.amount' },
          pointUsed: { $sum: '$item.itemPoint' },
        },
      },
      {
        $project: {
          _id: 0,
          itemCode: '$_id',
          itemName: 1,
          amountUsed: 1,
          pointUsed: 1,
        },
      },
    ]);

    // Membuat lookup ke koleksi item untuk mengambil itemName dan itemPrice
    const summaryWithDetails = await this.modelItem.aggregate([
      {
        $match: {
          itemCode: { $in: result.map((item) => item.itemCode) },
        },
      },
      {
        $project: {
          _id: 0,
          itemCode: 1,
          itemName: 1,
          itemPrice: 1,
        },
      },
    ]);

    // Menggabungkan hasil lookup dengan hasil sebelumnya
    const finalResult = result.map((item) => {
      const itemDetails = summaryWithDetails.find(
        (detail) => detail.itemCode === item.itemCode,
      );
      return {
        ...item,
        itemName: itemDetails?.itemName || null,
        totalPrice: item.amountUsed * itemDetails?.itemPrice,
      };
    });

    const direction =
      sortDirection === 'asc' ? 1 : sortDirection === 'desc' ? -1 : 0;

    finalResult.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) {
        return -1 * direction;
      }
      if (a[sortColumn] > b[sortColumn]) {
        return 1 * direction;
      }
      return 0;
    });

    return finalResult;
  }

  async reportEmployee(
    month: any,
    year: any,
    sortColumn: string,
    sortDirection: string,
  ) {
    const query: any = {};

    if (month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    } else {
      throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const result = await this.modelEmployeeTask.aggregate([
      {
        $match: query,
      },
      { $unwind: '$item' },
      {
        $group: {
          _id: '$item.itemCode',
          employeeCode: { $first: '$item.employeeCode' },
        },
      },
      {
        $project: {
          _id: 0,
          itemCode: '$_id',
          employeeCode: 1,
        },
      },
    ]);

    // Membuat lookup ke koleksi item untuk mengambil itemName dan itemPrice
    const summaryWithDetails = await this.modelItem.aggregate([
      {
        $match: {
          itemCode: { $in: result.map((item) => item.itemCode) },
        },
      },
      {
        $project: {
          _id: 0,
          itemCode: 1,
          itemName: 1,
          itemPrice: 1,
        },
      },
    ]);

    const employee = await this.modelEmployee.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $project: {
          _id: 0,
          employeeCode: 1,
          employeeName: 1,
        },
      },
    ]);

    const finalEmployee = employee.map((emp) => {
      const itemsInTrx = result.find(
        (trx) => trx.employeeCode === emp.employeeCode,
      );

      const employeeTaskUsed = itemsInTrx ? [itemsInTrx] : [];
      return {
        ...emp,
        employeeTaskUsed: employeeTaskUsed.length,
        transaction: employeeTaskUsed,
      };
    });

    // Menggabungkan hasil lookup dengan hasil sebelumnya
    // const finalResult = result.map((item) => {
    //   const itemDetails = summaryWithDetails.find(
    //     (detail) => detail.itemCode === item.itemCode,
    //   );

    //   return {
    //     ...item,
    //     itemName: itemDetails?.itemName || null,
    //     totalPrice: item.amountUsed * itemDetails?.itemPrice,
    //   };
    // });

    // const direction =
    //   sortDirection === 'asc' ? 1 : sortDirection === 'desc' ? -1 : 0;

    // finalResult.sort((a, b) => {
    //   if (a[sortColumn] < b[sortColumn]) {
    //     return -1 * direction;
    //   }
    //   if (a[sortColumn] > b[sortColumn]) {
    //     return 1 * direction;
    //   }
    //   return 0;
    // });

    return finalEmployee;
  }

  async addExpenses(createExpenses: CreateExpenses) {
    const expenses = new this.modelExpenses(createExpenses);
    const result = await expenses.save();
    await this.itemService.updateItemAmount(
      createExpenses.itemId,
      createExpenses.amount,
    );
    return { message: 'Success Add Data!', data: result };
  }

  async getExpenses(month: any, year: any) {
    const query: any = {};

    if (month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    }

    const expenses = await this.modelExpenses.find(query);

    return expenses;
  }

  async getReport(startDate: any, endDate: any, month: any, year: any) {
    try {
      if ((startDate && endDate) || (month && year)) {
        const query: any = {};
        if (startDate && endDate) {
          query.createdAt = { $gte: startDate, $lte: endDate };
        } else if (month && year) {
          const firstMonth = new Date(year, month - 1, 1);
          const lastMonth = new Date(year, month, 0, 23, 59, 59, 999);
          query.createdAt = { $gte: firstMonth, $lte: lastMonth };
        }

        const [transactions, expenses, payment] = await Promise.all([
          this.modelTransaction.find(query),
          this.modelExpenses.find(query),
          this.modelPayment.find(query),
        ]);

        const totalIncome = transactions.reduce(
          (total, transaksi) => total + transaksi.totalPrice,
          0,
        );
        const totalExpense = expenses.reduce(
          (total, pengeluaran) => total + pengeluaran.price,
          0,
        );

        const summary = totalIncome - totalExpense;

        const paymentUsage = {};

        payment.forEach((payment) => {
          if (!paymentUsage[payment.paymentMethod]) {
            paymentUsage[payment.paymentMethod] = 1;
          } else {
            paymentUsage[payment.paymentMethod]++;
          }
        });

        const financialReport = {
          month,
          year,
          totalIncome,
          totalExpense,
          summary,
        };

        return {
          message: '',
          data: {
            financialReport,
            paymentUsage,
          },
        };
      } else {
        throw new Error('Bulan dan tahun diperlukan.');
      }
    } catch (error) {
      throw new Error('Terjadi kesalahan dalam mengambil laporan pendapatan.');
    }
  }
}
