import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  createOrder(
    @Body()
    userCode: {
      customerCode: string;
    },
    @Req() req,
  ) {
    const user = req.user;

    return this.transactionService.createOrder(user.sub, userCode);
  }

  @Put(':paymentCode')
  addItem(
    @Param('paymentCode')
    paymentCode: string,
    @Body()
    items: {
      data: {
        itemCode: string;
        amount: number;
        employeeCode: string;
      }[];
    },
  ) {
    return this.transactionService.addItem(paymentCode, items);
  }

  // @Patch('updatePaymentMethod')
  // updatePaymentMethod(
  //   @Body()
  //   payment: {
  //     paymentCode: string;
  //     paymentMethod: string;
  //   },
  // ) {
  //   return this.transactionService.updatePaymentMethod(payment);
  // }

  @Put('updatePaymentStatus')
  updatePaymentStatus(
    @Body()
    payment: {
      paymentCode: string;
      paymentMethod: string;
      paymentPrice: number;
    },
  ) {
    return this.transactionService.updatePaymentStatus(payment);
  }

  @Get('payment')
  getLastTransaction() {
    return this.transactionService.getLastTransaction();
  }

  @Get('payment/:paymentCode')
  getPayment(@Param('paymentCode') paymentCode: string) {
    return this.transactionService.getPaymentDetail(paymentCode);
  }

  @Get(':paymentCode')
  getTransaction(@Param('paymentCode') paymentCode: string) {
    return this.transactionService.findOneTrx(paymentCode);
  }

  @Get()
  findAll(
    @Query('day')
    day: any,
    @Query('month')
    month: any,
    @Query('year')
    year: any,
  ) {
    return this.transactionService.findAll(day, month, year);
  }
}
