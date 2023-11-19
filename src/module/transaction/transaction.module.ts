import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { SharedModule } from '../shared/shared.module';
import { LogService } from 'src/common/log/log.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';

@Module({
  imports: [
    SharedModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('MULTER_DEST'),
          filename: (req, file, cb) => {
            cb(null, file.originalname);
          },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, LogService],
})
export class TransactionModule {}
