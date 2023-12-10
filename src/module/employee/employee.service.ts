import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Employee } from './entities/employee.entity';
import { Item } from '../item/entities/item.entity';
import { EmployeeTaskReport } from './entities/employee.task.report';
import { EmployeeTask } from './entities/employee.task';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel('Employee') private modelEmployee: Model<Employee>,
    @InjectModel('EmployeeTask') private modelEmployeeTask: Model<EmployeeTask>,
    @InjectModel('EmployeeTaskReport')
    private modelEmployeeTaskReport: Model<EmployeeTaskReport>,
    @InjectModel('Item') private modelItem: Model<Item>,
  ) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const employee = new this.modelEmployee(createEmployeeDto);
    const result = await employee.save();

    return {
      status: HttpStatus.CREATED,
      message: 'Employee added',
      detail: result,
    };
  }

  async findAll(keyword: string) {
    const regexPattern = new RegExp(keyword, 'i');
    const business = await this.modelEmployee.find({
      employeeName: regexPattern,
      deletedAt: null,
    });
    return business;
  }

  async asignTask(itemCode: string, employees: string[]) {
    const task = await this.modelEmployeeTask.findOne({ itemCode: itemCode });

    if (!task) {
      const employeeData = [];
      for (const employee of employees) {
        const empl = await this.modelEmployee.findOne({
          employeeCode: employee,
        });

        employeeData.push({
          employeeCode: empl.employeeCode,
          employeeName: empl.employeeName,
        });
      }
      const data = {
        itemCode,
        employee: employeeData,
      };
      const assignTask = new this.modelEmployeeTask(data);
      const result = await assignTask.save();

      return {
        message: `Success assign task`,
        data: result,
      };
    }

    const employeeEdit = [];
    for (const employee of employees) {
      const empl = await this.modelEmployee.findOne({
        employeeCode: employee,
      });

      const checkDuplicate = await this.modelEmployeeTask.findOne({
        itemCode: itemCode,
        employee: {
          $elemMatch: {
            employeeCode: employee,
          },
        },
      });

      if (checkDuplicate) {
        throw new HttpException(
          'Ada karyawan yanng sudah di tugaskan pada jasa ini',
          HttpStatus.BAD_REQUEST,
        );
      }
      employeeEdit.push({
        employeeCode: empl.employeeCode,
        employeeName: empl.employeeName,
      });
    }

    const result = await this.modelEmployeeTask.updateOne({
      $addToSet: { employee: { $each: employeeEdit } },
    });

    return {
      message: `Berhasil menugaskan karyawan!`,
      data: result,
    };
  }

  async findOne(code: string, date: any, month: any, year: any) {
    const query: any = { employeeCode: code };

    // Jika semua parameter tanggal (date, month, dan year) terdefinisi, maka filter harian
    if (date && month && year) {
      const awalBulan = new Date(year, month - 1, date);
      const akhirBulan = new Date(year, month - 1, date, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    }
    // Jika hanya parameter bulan (month) dan tahun (year) yang terdefinisi, maka filter bulanan
    else if (month && year) {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: awalBulan, $lte: akhirBulan };
    }

    const employee = await this.modelEmployee.findOne({ employeeCode: code });

    if (!employee) {
      return null;
    }

    const employeeTask = await this.modelEmployeeTaskReport.find(query);

    const report = {
      taskFinished: employeeTask.length,
      task: employeeTask,
    };

    return {
      ...employee.toObject(),
      report,
    };
  }

  async employeeTask(employeeCode: string) {
    // const task = await this.modelEmployeeTask.find({
    //   'employee.employeeCode': { $elemMatch: { employeeCode: employeeCode } },
    // });
    // console.log(task)
  }

  async update(employeeId: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.modelEmployee.findByIdAndUpdate(
      {
        _id: employeeId,
      },
      { updateEmployeeDto },
    );

    // console.log(
    //   'employeeInput:' + updateEmployeeDto,
    //   'employeeData: ' + employee,
    // );
    // const result = await employee.updateOne({
    //   updateEmployeeDto,
    // });

    return {
      message: 'Employee Updated!',
      employee,
    };
  }

  async remove(employeeId: string) {
    const employee = await this.modelEmployee.findOne({
      _id: employeeId,
    });

    const result = await employee.updateOne({
      deletedAt: new Date(),
    });

    return {
      message: 'Employee Deleted!',
      result,
    };
  }
}
