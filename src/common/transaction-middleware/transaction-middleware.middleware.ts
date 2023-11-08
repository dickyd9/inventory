import { Injectable, NestMiddleware } from '@nestjs/common';
import { Model } from 'mongoose';
import { Item } from 'src/module/item/entities/item.entity';

@Injectable()
export class TransactionMiddlewareMiddleware implements NestMiddleware {
  constructor(private readonly modelItem: Model<Item>) {}

  async use(req: any, res: any, next: () => void) {
    // const item = await this.modelItem.findOne({ itemCode: itemCode });
    // if (!item) {
    //   throw new Error('Item tidak ditemukan');
    // }

    // // if (item.status !== 'open') {
    // //   throw new Error('Item sedang tidak tersedia');
    // // }

    // const itemData = await this.modelItem.findOne({ itemCode: itemCode });
    // // Cek ketersediaan jumlah item
    // if (item.itemAmount < amount) {
    //   throw new HttpException(
    //     `Jumlah item '${itemData.itemName}' tidak mencukupi`,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    next();
  }
}
