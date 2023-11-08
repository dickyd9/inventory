import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { SharedModule } from '../shared/shared.module';
import { LogService } from 'src/common/log/log.service';

@Module({
  imports: [SharedModule],
  controllers: [TransactionController],
  providers: [TransactionService, LogService],
})
export class TransactionModule {}
