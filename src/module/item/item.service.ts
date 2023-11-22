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
      type: result.itemType,
      count: 1,
    };
  }

  async createCategoryItem(categoryItem: object) {
    const category = new this.itemCategoryModel(categoryItem);
    const result = await category.save();
    return result;
  }

  async getCategoryItem() {
    const category = await this.itemCategoryModel.find();
    return category;
  }

  async getAllItem(keyword: any): Promise<Item[]> {
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      const item = await this.itemModel.find({
        $or: [{ itemName: regex }, { itemCode: regex }],
      });
      return item;
    }
    const item = await this.itemModel.find();
    return item;
  }

  async getMenu(type: string): Promise<Item[]> {
    if (type) {
      const item = await this.itemModel.find({ itemType: type });
      return item;
    } else {
      const item = await this.itemModel.find();
      return item;
    }
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

  update(id: number, updateItemDto: UpdateItemDto) {
    return `This action updates a #${id} item`;
  }

  async remove(id: string) {
    await this.itemModel.findOneAndDelete({ _id: id });
    return {
      message: 'Success delete Item',
      count: 1,
    };
  }
}
