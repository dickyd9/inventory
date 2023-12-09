import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './entities/item.entity';
import { ItemCategory } from './entities/item.category';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeTask } from '../employee/entities/employee.task';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel('Item') private itemModel: Model<Item>,
    @InjectModel('Employee') private employeeModel: Model<Employee>,
    @InjectModel('EmployeeTask') private employeTaskeModel: Model<EmployeeTask>,
    @InjectModel('ItemCategory') private itemCategoryModel: Model<ItemCategory>,
  ) {}

  async createItem(createItemDto: CreateItemDto) {
    const item = new this.itemModel(createItemDto);
    const result = await item.save();
    return {
      status: 'Success add item',
      name: result.itemName,
      code: result.itemCode,
      count: 1,
    };
  }

  async getAllItem(keyword: any, type: string): Promise<Item[]> {
    const query: any = {};

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ itemName: regex }, { itemCode: regex }];
    }

    if (type) {
      query.itemType = type;
    }

    const items = await this.itemModel.find(query);
    return items;
  }

  async findOne(itemId: string) {
    const item = await this.itemModel
      .findById(itemId)
      .select('-_id -__v')
      .exec();
    return item;
  }

  async updateItemStatus(itemCode: string) {
    const itemempty = await this.itemModel
      .findOneAndUpdate({ itemCode }, { itemStatus: 'close' }, { new: true })
      .exec();

    return itemempty;
  }

  async update(itemId: string, updateItemDto: UpdateItemDto) {
    const item = await this.itemModel.findOne({ _id: itemId });
    const result = await item.updateOne(updateItemDto);
    return {
      message: 'Item Updated!',
      result,
    };
  }

  async remove(itemId: string) {
    await this.itemModel.findOneAndUpdate(
      { _id: itemId },
      { deletedAt: new Date() },
    );
    return {
      message: 'Success delete Item',
      count: 1,
    };
  }
}
