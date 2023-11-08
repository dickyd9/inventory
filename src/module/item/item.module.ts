import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema } from './entities/item.entity';
import { ItemCategorySchema } from './entities/item.category';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Item', schema: ItemSchema },
      { name: 'ItemCategory', schema: ItemCategorySchema },
    ]),
    SharedModule,
  ],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
