import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Item } from '../item/entities/item.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Employee } from '../employee/entities/employee.entity';
import { CreateExpenses } from './dto/create-expenses.dto';
import { Expenses } from './entities/expense.entity';
import { PaymentRelation } from '../transaction/entities/payment-relation';
import { Customer } from '../customer/entities/customer.entity';
import { ItemService } from '../item/item.service';
import { EmployeeTask } from '../employee/entities/employee.task';
import { EmployeeTaskReport } from '../employee/entities/employee.task.report';
import { Services } from '../services/entities/service.entity';
import { TransactionReport } from '../transaction/entities/transaction.report';
import { CustomerReport } from '../customer/entities/customer.report.entity';
import { CustomerPoint } from '../customer/entities/customer.point.entity';
import { ExportService } from 'src/common/export/export.service';
import { ItemReport } from '../item/entities/item.report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('ItemReport') private modelItemReport: Model<ItemReport>,
    @InjectModel('Services') private modelServices: Model<Services>,
    @InjectModel('Transaction') private modelTransaction: Model<Transaction>,
    @InjectModel('TransactionReport')
    private modelTransactionReport: Model<TransactionReport>,
    @InjectModel('PaymentRelation')
    private modelPayment: Model<PaymentRelation>,
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTask') private modelEmployeeTask: Model<EmployeeTask>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,
    @InjectModel('Customer') private modelCustomer: Model<Customer>,
    @InjectModel('CustomerPoint')
    private modelCustomerPoint: Model<CustomerPoint>,
    @InjectModel('CustomerReport')
    private modelCustomerReport: Model<CustomerReport>,
    @InjectModel('Expenses') private modelExpenses: Model<Expenses>,
    private readonly itemService: ItemService,
    private readonly exportService: ExportService,
  ) {}

  async reportTransaction(report: any, month: any, year: any) {
    const query: any = {};

    if (month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    } else {
      throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const trx = await this.modelTransaction.find(query);

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

  async reportTransactionDetail(paymentCode: string) {
    const transaction = await this.modelTransaction.aggregate([
      {
        $match: {
          paymentCode: paymentCode,
        },
      },
      {
        $lookup: {
          from: 'paymentrelations',
          localField: 'paymentCode',
          foreignField: 'paymentCode',
          as: 'paymentDetails',
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerCode',
          foreignField: 'customerCode',
          as: 'customerDetail',
        },
      },
      {
        $unwind: '$paymentDetails',
      },
      {
        $unwind: '$customerDetail',
      },
    ]);

    let result;
    await Promise.all(
      transaction.map(async (data) => {
        const items = await this.modelItem.aggregate([
          {
            $match: {
              itemCode: {
                $in: data.item.map((item) => item.itemCode),
              },
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

        const employeeHandle = await this.modelEmployee.aggregate([
          {
            $match: {
              employeeCode: {
                $in: data.item.map((item) => item.employeeCode),
              },
            },
          },
        ]);
        const finalResult = data.item.map((item) => {
          const itemDetails = items.find((i) => item.itemCode == i.itemCode);

          return {
            itemCode: itemDetails.itemCode,
            itemName: itemDetails.itemName,
            itemPoint: itemDetails.itemPoint,
            itemPrice: itemDetails.itemPrice,
            amount: item.amount,
            employeeTask: employeeHandle[0],
          };
        });

        console.log(data);
        result = {
          paymentCode: data.paymentCode,
          customerCode: data.customerCode,
          item: finalResult,
          totalPoint: data.totalPoint,
          totalAmount: data.totalAmount,
          totalPrice: data.totalPrice,
          paymentDetail: data.paymentDetails,
          customerDetail: data.customerDetail,
        };
      }),
    );

    return result;
  }

  async exportTransaction(res: any, report: any, month: any, year: any) {
    try {
      const data = await this.reportTransaction(report, month, year);
      const result = await this.exportService.exportExcel(data, res);

      return result;
    } catch (error) {
      throw new HttpException('Data Not Found', HttpStatus.NOT_FOUND);
    }
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

    const reportService = await this.modelTransactionReport.find();

    let report = [];
    await Promise.all(
      reportService.map(async (rs) => {
        try {
          query._id = new mongoose.Types.ObjectId(rs.transactionId);
          const result = await this.modelTransaction.aggregate([
            {
              $match: query,
            },
            { $unwind: '$item' },
            {
              $group: {
                _id: '$item.itemCode',
                itemName: { $first: '$itemName' },
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
                itemCode: {
                  $in: result.map((item) => item.itemCode),
                },
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

          report = finalResult;
        } catch (error) {
          return;
        }
      }),
    );
    return report;
  }

  async detailReportService(itemCode: string) {
    const reportService = await this.modelTransactionReport.find();

    let report;
    await Promise.all(
      reportService.map(async (rs) => {
        try {
          const result = await this.modelTransaction.aggregate([
            { $unwind: '$item' },
            {
              $group: {
                _id: '$item.itemCode',
                itemName: { $first: '$itemName' },
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
          const summaryWithDetails = await this.modelItemReport.aggregate([
            {
              $match: {
                itemCode: {
                  $in: result.map((item) => item.itemCode),
                },
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

          const finalResult = result.map((item) => {
            const itemDetails = summaryWithDetails.find(
              (detail) => detail.itemCode === item.itemCode,
            );
            return {
              itemCode: itemDetails.itemCode,
              itemName: itemDetails?.itemName || null,
              itemPrice: itemDetails?.itemPrice || null,
              transactionRef: item?.transactionCode || null,
              totalAmount: item.amountUsed,
              totalPrice: item.amountUsed * itemDetails?.itemPrice,
            };
          });

          report = finalResult;
        } catch (error) {
          return;
        }
      }),
    );

    console.log(report);
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

    // const result = await this.modelEmployeeTaskReport.find(query);
    const result = await this.modelEmployeeTaskReport.aggregate([
      {
        $match: query,
      },
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

    const direction =
      sortDirection === 'asc' ? 1 : sortDirection === 'desc' ? -1 : 0;

    result.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) {
        return -1 * direction;
      }
      if (a[sortColumn] > b[sortColumn]) {
        return 1 * direction;
      }
      return 0;
    });

    return result;
  }

  // Expenses
  async addExpenses(createExpenses: CreateExpenses) {
    const expenses = new this.modelExpenses(createExpenses);
    const result = await expenses.save();
    if (createExpenses.itemCode) {
      await this.itemService.updateItemAmount(
        createExpenses.itemCode,
        createExpenses.amount,
      );
    }

    return { message: 'Success Add Data!', data: result };
  }

  async getExpenses(month: any, year: any) {
    const query: any = {};

    if (month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    }

    const result = [];
    const expenses = await this.modelExpenses.find(query);
    await Promise.all(
      expenses.map(async (ex) => {
        const item = await this.modelItem.findOne({ itemCode: ex.itemCode });
        result.push({
          itemOrDesc: item?.itemName || ex.description,
          amount: ex.amount,
          paymentMethod: ex.paymentMethod,
          price: ex.price,
          note: ex.note,
          createdAt: ex.createdAt,
        });
      }),
    );

    return result;
  }

  async deleteExpenses(expensesId: string) {
    const expenses = await this.modelExpenses.findByIdAndDelete({
      _id: expensesId,
    });

    return {
      message: 'Delete Success!',
      expenses,
    };
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

        const paymentUsage = {
          income: {},
          expenses: {},
        };

        payment.forEach((payment) => {
          if (!paymentUsage[payment.paymentMethod]) {
            paymentUsage.income[payment.paymentMethod] = 1;
          } else {
            paymentUsage.income[payment.paymentMethod]++;
          }
        });

        expenses.forEach((expenses) => {
          if (!paymentUsage[expenses.paymentMethod]) {
            paymentUsage.expenses[expenses.paymentMethod] = 1;
          } else {
            paymentUsage.expenses[expenses.paymentMethod]++;
          }
        });

        const financialReport = {
          month,
          year,
          totalTransaction: transactions.length,
          totalIncome,
          totalExpense,
          summary,
        };

        return {
          message: 'Data Found!',
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

  // async exportReport(res: any, report: any, month: any, year: any) {
  //   try {
  //     const data = await this.getReport(report, month, year);
  //     const result = await this.exportService.exportExcel(data, res);

  //     return result;
  //   } catch (error) {
  //     throw new HttpException('Data Not Found', HttpStatus.NOT_FOUND);
  //   }
  // }
}
