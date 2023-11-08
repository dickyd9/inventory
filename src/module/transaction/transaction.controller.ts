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
  createInvoice(
    @Body()
    userCode: {
      customerCode: string;
    },
    @Req() req,
  ) {
    const user = req.user;

    return this.transactionService.createTicket(user.sub, userCode);
  }

  @Put(':paymentCode')
  createTransaction(
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
    return this.transactionService.createTransaction(paymentCode, items);
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

  @Patch('updatePayment')
  updatePaymentStatus(
    @Body()
    payment: {
      paymentCode: string;
      paymentStatus: string;
    },
  ) {
    return this.transactionService.updatePaymentStatus(payment);
  }

  @Patch('updatePaymentMethod')
  updatePaymentMethod(
    @Body()
    payment: {
      paymentCode: string;
      paymentMethod: string;
      paymentAmount: number
    },
  ) {
    return this.transactionService.updatePaymentMethod(payment);
  }
}
