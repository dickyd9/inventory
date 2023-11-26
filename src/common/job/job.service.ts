import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ItemService } from 'src/module/item/item.service';
import { TransactionService } from 'src/module/transaction/transaction.service';

@Injectable()
export class JobService {
  constructor(
    private readonly itemService: ItemService,
    private readonly transactionService: TransactionService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredTransactions() {
    // const expiredTransactions =
    //   await this.transactionService.findExpiredTransactions();

    // for (const transaction of expiredTransactions) {
    //   await this.transactionService.markTransactionAsExpired(
    //     transaction.transactionId,
    //     transaction.paymentCode,
    //   );
    // }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  // async handleEmptyItem() {
  //   const checkEmpty = await this.itemService.getAllItem('product');

  //   for (const item of checkEmpty) {
  //     if(item.itemAmount === 0) {
  //       await this.itemService.updateItemStatus(item.itemCode);
  //     }
  //   }
  // }
}
