import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SharedModule } from '../shared/shared.module';
import { ItemService } from '../item/item.service';

@Module({
  imports: [SharedModule],
  controllers: [ReportController],
  providers: [ReportService, ItemService],
})
export class ReportModule {}
