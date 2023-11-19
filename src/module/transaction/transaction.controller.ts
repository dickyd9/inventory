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
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { TransactionService } from './transaction.service';
import { FileInterceptor } from '@nestjs/platform-express';
import fs, { createReadStream } from 'fs';
import { Public } from 'src/config/database/meta';
import path, { join } from 'path';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('saveInv')
  @UseInterceptors(FileInterceptor('file'))
  saveInvoice(@UploadedFile() file) {
    try {
      return { message: 'File berhasil disimpan', filename: file.originalname };
    } catch (error) {
      return { message: 'Gagal menyimpan file', error: error.message };
    }
  }

  @Get('invoice/:invoiceName')
  @Public()
  async getFile(
    @Res({ passthrough: true }) res,
    @Param('invoiceName') invoiceName: string,
  ): Promise<StreamableFile> {
    try {
      const file = createReadStream(
        join(process.cwd(), `uploads/${invoiceName}`),
      );
      res.set({
        'Content-Type': 'application/pdf',
      });
      return new StreamableFile(file);
    } catch (error) {
      res.status(500).send(error);
    }
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
