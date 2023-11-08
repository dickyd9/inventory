import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { TransactionService } from 'src/module/transaction/transaction.service';
import { SharedModule } from 'src/module/shared/shared.module';
import { ItemService } from 'src/module/item/item.service';

@Module({
  imports: [SharedModule],
  providers: [JobService, TransactionService, ItemService],
})
export class JobModule {}
