import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateItemDto, ItemCategoryDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Item } from './entities/item.entity';
import { ItemCategory } from './entities/item.category';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel('Item') private modelItem: Model<Item>,
    @InjectModel('ItemCategory') private modelItemCategory: Model<ItemCategory>,
  ) {}

  async createItem(createItemDto: CreateItemDto) {
    const item = new this.modelItem(createItemDto);
    const result = await item.save();
    return {
      message: 'Success add item',
      name: result.itemName,
      code: result.itemCode,
      count: 1,
    };
  }

  async getAllItem(
    keyword: any,
    type: string,
    category: string,
  ): Promise<Item[]> {
    const query: any = {
      deletedAt: null,
    };

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ itemName: regex }, { itemCode: regex }];
    }

    if (category) {
      query.itemCategory = new mongoose.Types.ObjectId(category);
    }

    if (type) {
      query.itemType = type;
    }

    const items = await this.modelItem.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'itemcategories',
          localField: 'itemCategory',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryData.categoryName', 0] },
        },
      },
      {
        $project: {
          categoryData: 0,
        },
      },
    ]);

    return items;
  }

  async findOne(itemId: string) {
    const item = await this.modelItem
      .findById(itemId)
      .select('-_id -__v')
      .exec();
    return item;
  }

  async updateItemAmount(itemCode: string, amount: number) {
    try {
      const item = await this.modelItem.findOne({ itemCode: itemCode });
      if (!item) {
        throw new HttpException('Item tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      if (item?.itemAmount < 1) {
        throw new HttpException(
          'Jumlah Item Tidak Mencukupi!',
          HttpStatus.EXPECTATION_FAILED,
        );
      } else {
        const result = await item.updateOne({
          itemAmount: item.itemAmount + amount,
        });
        return {
          message: 'Amount Updated',
          result,
        };
      }
    } catch (error) {
      const errorMessage =
        error && error.message ? error.message : 'Error tidak diketahui';
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }
  }

  async updateItemStatus(itemCode: string) {
    const itemempty = await this.modelItem
      .findOneAndUpdate({ itemCode }, { itemStatus: 'close' }, { new: true })
      .exec();

    return itemempty;
  }

  async update(itemId: string, updateItemDto: UpdateItemDto) {
    const item = await this.modelItem.findOne({ _id: itemId });
    const result = await item.updateOne(updateItemDto);
    return {
      message: 'Item Updated!',
      result,
    };
  }

  async remove(itemId: string) {
    // await this.modelItem.findOneAndUpdate(
    //   { _id: itemId },
    //   { deletedAt: new Date() },
    // );
    await this.modelItem.findOneAndDelete({
      _id: itemId,
    });
    return {
      message: 'Success delete Item',
      count: 1,
    };
  }

  async assignItemServices(itemId: string, itemAssign: object[]) {
    try {
      const item = await this.modelItem.findOne({ _id: itemId });

      const useService = [];
      itemAssign.map((item: any) => {
        useService.push({
          itemCode: item?.code,
          amount: item?.amount,
          addDate: new Date(),
        });
      });

      const result = await item.updateOne({
        itemUseService: useService,
      });

      return {
        message: `${item.itemName} success assign item!`,
        result,
      };
    } catch (error) {}
  }

  async assignItemCat(itemId: any, categoryId: any) {
    const categories = await this.modelItemCategory.findOne({
      _id: categoryId,
    });

    if (!categories) {
      throw new HttpException('Category Not Found!', HttpStatus.NOT_FOUND);
    }

    const item = await this.modelItem.findOne({ _id: itemId });

    const result = await item.updateOne({
      itemCategory: categories._id,
    });

    return {
      message: `Services assigned for ${categories.categoryName}`,
      result,
    };
  }

  // Item Category
  async createItemCategory(itemCategoryDto: ItemCategoryDto) {
    const cat = new this.modelItemCategory(itemCategoryDto);

    const data = await cat.save();
    return {
      message: 'Category Created!',
      data,
    };
  }

  async findAllCategory(keyword: any) {
    const query: any = {
      deletedAt: null,
    };

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ itemName: regex }, { itemCode: regex }];
    }

    const cat = await this.modelItemCategory.find(query).exec();

    const result = [];
    await Promise.all(
      cat.map(async (cat: any) => {
        const services = await this.modelItem.find({
          itemCategory: cat._id,
        });
        const serviceCategory = {
          _id: cat._id,
          categoryCode: cat.categoryCode,
          categoryName: cat.categoryName,
          totalService: services.length,
        };

        result.push(serviceCategory);
      }),
    );

    return result;
  }

  async udpateCategory(categoryId: string, category: any) {
    const cat = await this.modelItemCategory.findOne({
      _id: categoryId,
    });

    const result = await cat.updateOne({
      categoryName: category.categoryName,
    });

    return {
      message: 'Category updated!',
      result,
    };
  }

  async deleteCategory(categoryId: string) {
    const cat = await this.modelItemCategory.findOne({
      _id: categoryId,
    });

    const result = await cat.updateOne({
      deletedAt: new Date(),
    });

    return result;
  }
}
