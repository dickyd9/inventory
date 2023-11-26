import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { SharedModule } from '../shared/shared.module';
import { LogService } from 'src/common/log/log.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from 'src/common/storage/storage.service';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [SharedModule, StorageModule, ConfigModule.forRoot()],
  controllers: [TransactionController],
  providers: [TransactionService, LogService, StorageService, ConfigService],
})
export class TransactionModule {}
