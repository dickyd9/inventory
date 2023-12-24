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
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Public } from 'src/config/database/meta';
import { StorageService } from 'src/common/storage/storage.service';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly storageService: StorageService,
  ) {}

  @Post('saveInv/:paymentCode')
  @UseInterceptors(FileInterceptor('file'))
  async saveInvoice(
    @UploadedFile() file,
    @Param('paymentCode') paymentCode: string,
  ) {
    return this.transactionService.saveInvoice(file, paymentCode);
  }

  @Get('invoice/:paymentCode')
  @Public()
  getFile(@Res() res: Response, @Param('paymentCode') paymentCode: any) {
    return this.transactionService.getInvoice(res, paymentCode);
  }

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
        serviceCode: string;
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

  @Patch('updatePaymentStatus/:paymentCode')
  updatePaymentStatus(
    @Param('paymentCode')
    paymentCode: string,

    @Body()
    payment: {
      paymentMethod: string;
      paymentPrice: number;
    },
  ) {
    return this.transactionService.updatePaymentStatus(paymentCode, payment);
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
