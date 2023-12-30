import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServicesCategory } from '../services/entities/service.category.entity';
import { Item } from '../item/entities/item.entity'

@Injectable()
export class MasterService {
  constructor(
    @InjectModel('ServicesCategory')
    private modelServicesCategory: Model<ServicesCategory>,
    @InjectModel('Item')
    private modelItem: Model<Item>,
  ) {}

  async getAllService() {
    const categories = await this.modelServicesCategory.find({
      deletedAt: null
    })

    return {
      message: 'Success Get Data!',
      data: categories
    }
  }

  async getAllItem() {
    const item = await this.modelItem.find()
    return {
      message: 'Message',
      item
    }
  }
}
