import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [ServicesController],
  providers: [ServicesService]
})
export class ServicesModule {}
