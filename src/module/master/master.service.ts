import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../item/entities/item.entity';
import { ItemCategory } from '../item/entities/item.category';

@Injectable()
export class MasterService {
  constructor(
    @InjectModel('ItemCategory')
    private modelItemCategory: Model<ItemCategory>,
    @InjectModel('Item')
    private modelItem: Model<Item>,
  ) {}

  async getItemCategory() {
    const categories = await this.modelItemCategory.find({
      deletedAt: null,
    });

    return {
      message: 'Success Get Data!',
      data: categories,
    };
  }

  async getAllItem() {
    const item = await this.modelItem.find({
      itemType: 'product'
    });
    return {
      message: 'Message',
      item,
    };
  }
  async getAllService() {
    const data = await this.modelItem.find({
      itemType: 'services'
    });
    return {
      message: 'Message',
      data,
    };
  }
}
