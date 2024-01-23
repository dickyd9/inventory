import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SharedModule } from '../shared/shared.module';
import { ItemService } from '../item/item.service';
import { ExportService } from 'src/common/export/export.service';

@Module({
  imports: [SharedModule],
  controllers: [ReportController],
  providers: [ReportService, ItemService, ExportService],
})
export class ReportModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('transaction/report');
  }
}
