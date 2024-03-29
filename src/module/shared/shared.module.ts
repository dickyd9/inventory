import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from '../user/entities/user.entity';
import { BusinessSchema } from '../business/entities/business.entity';
import { profileUserSchema } from '../user/entities/profile-user.entity';
import { TransactionSchema } from '../transaction/entities/transaction.entity';
import { ServicesSchema } from '../services/entities/service.entity';
import { ItemSchema } from '../item/entities/item.entity';
import { PaymentRelationSchema } from '../transaction/entities/payment-relation';
import { ItemCategorySchema } from '../item/entities/item.category';
import { userRoleSchema } from '../user/entities/user-role.entity';
import { LogSchema } from 'src/common/log/log.schema';
import { EmployeeSchema } from '../employee/entities/employee.entity';
import { CustomerSchema } from '../customer/entities/customer.entity';
import { CustomerPointSchema } from '../customer/entities/customer.point.entity';
import { EmployeeTaskReportSchema } from '../employee/entities/employee.task.report';
import { EmployeeTaskSchema } from '../employee/entities/employee.task';
import { userLogSchema } from '../user/entities/user-log-entity';
import { ExpensesSchema } from '../report/entities/expense.entity';
import { ServicesCategorySchema } from '../services/entities/service.category.entity';
import { CustomerReportSchema } from '../customer/entities/customer.report.entity';
import { TransactionReportSchema } from '../transaction/entities/transaction.report';
import { BookingTransactionSchema } from '../transaction/entities/booking-transaction';
import { ItemReportSchema } from '../item/entities/item.report.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Log', schema: LogSchema },
      { name: 'User', schema: userSchema },
      { name: 'UserLog', schema: userSchema },
      { name: 'Profile', schema: profileUserSchema },
      { name: 'UserRole', schema: userRoleSchema },
      { name: 'Business', schema: BusinessSchema },
      { name: 'ProfileUser', schema: profileUserSchema },
      { name: 'Services', schema: ServicesSchema },
      { name: 'ServicesCategory', schema: ServicesCategorySchema },
      { name: 'Item', schema: ItemSchema },
      { name: 'ItemReport', schema: ItemReportSchema },
      { name: 'ItemCategory', schema: ItemCategorySchema },
      { name: 'BookingTransaction', schema: BookingTransactionSchema },
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'TransactionReport', schema: TransactionReportSchema },
      { name: 'PaymentRelation', schema: PaymentRelationSchema },
      { name: 'Employee', schema: EmployeeSchema },
      { name: 'EmployeeTask', schema: EmployeeTaskSchema },
      { name: 'EmployeeTaskReport', schema: EmployeeTaskReportSchema },
      { name: 'Customer', schema: CustomerSchema },
      { name: 'CustomerReport', schema: CustomerSchema },
      { name: 'CustomerPoint', schema: CustomerPointSchema },
      { name: 'Expenses', schema: ExpensesSchema },
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: 'Log', schema: LogSchema },
      { name: 'User', schema: userSchema },
      { name: 'UserLog', schema: userLogSchema },
      { name: 'Profile', schema: profileUserSchema },
      { name: 'UserRole', schema: userRoleSchema },
      { name: 'Business', schema: BusinessSchema },
      { name: 'ProfileUser', schema: profileUserSchema },
      { name: 'Services', schema: ServicesSchema },
      { name: 'ServicesCategory', schema: ServicesCategorySchema },
      { name: 'Item', schema: ItemSchema },
      { name: 'ItemReport', schema: ItemReportSchema },
      { name: 'ItemCategory', schema: ItemCategorySchema },
      { name: 'BookingTransaction', schema: BookingTransactionSchema },
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'TransactionReport', schema: TransactionReportSchema },
      { name: 'PaymentRelation', schema: PaymentRelationSchema },
      { name: 'Employee', schema: EmployeeSchema },
      { name: 'EmployeeTask', schema: EmployeeTaskSchema },
      { name: 'EmployeeTaskReport', schema: EmployeeTaskReportSchema },
      { name: 'Customer', schema: CustomerSchema },
      { name: 'CustomerReport', schema: CustomerReportSchema },
      { name: 'CustomerPoint', schema: CustomerPointSchema },
      { name: 'Expenses', schema: ExpensesSchema },
    ]),
  ],
})
export class SharedModule {}
