import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { TransactionService } from 'src/module/transaction/transaction.service';
import { SharedModule } from 'src/module/shared/shared.module';
import { ItemService } from 'src/module/item/item.service';
import { StorageService } from '../storage/storage.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [SharedModule],
  providers: [
    JobService,
    TransactionService,
    ItemService,
    StorageService,
    ConfigService,
  ],
})
export class JobModule {}
