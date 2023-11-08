import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateBusinessDto,
  OutletDto,
  assignItemDto,
} from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from './entities/business.entity';
import { Item } from '../item/entities/item.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business') private businessModel: Model<Business>,
    @InjectModel('Item') private itemModel: Model<Item>,
  ) {
    const logger = new Logger('business');
  }
  async createBusiness(createBusinessDto: CreateBusinessDto) {
    const business = new this.businessModel(createBusinessDto);
    await business.save();
    return {
      message: 'Business has created!',
      data: createBusinessDto.businessName,
      count: 1,
    };
  }

  async assignItem(businessId: string, itemsBody: string[]): Promise<any> {
    try {
      const business = await this.businessModel.findById(businessId);

      const { businessName, item } = business;
      const items = [];
      
      const checkDupicate = item.filter((f) => itemsBody.includes(f));

      for (const itemId of checkDupicate) {
        if (checkDupicate) {
          const checkItem = await this.itemModel.findOne({ _id: itemId });
          items.push(checkItem);
        }
      }
      if (checkDupicate.length > 0) {
        throw new HttpException(
          `Item [${items.map((i) => i.itemName)}] sudah tersedia`,
          HttpStatus.BAD_REQUEST,
        );
      }

      await business.updateOne({
        $addToSet: { item: { $each: itemsBody } },
      });

      return {
        message: `Success assign ${itemsBody.length} item for ${businessName}`,
        data: items,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(keyword: string) {
    const regexPattern = new RegExp(keyword, 'i');
    const business = await this.businessModel.find({
      businessName: regexPattern,
    });
    return business;
  }

  async findOne(businessCode: string) {
    try {
      const business = await this.businessModel.findOne({
        businessCode: businessCode,
      });
      return business;
    } catch (error) {}
  }

  async update(businessCode: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await this.businessModel.findOneAndUpdate(
      { businessCode: businessCode },
      { updateBusinessDto },
    );
    return business;
  }

  async updateOutlet(businessCode: string, outlets: OutletDto[]) {
    try {
      // Cari bisnis berdasarkan ID
      const business = await this.businessModel.findOne({
        businessCode: businessCode,
      });

      if (!business) {
        throw new Error('Bisnis tidak ditemukan');
      }

      const updatedBusiness = await this.businessModel.findOneAndUpdate(
        { businessCode: businessCode },
        {
          outlets: outlets,
        },
        { new: true },
      );

      if (!updatedBusiness) {
        throw new NotFoundException(
          `Business with id ${businessCode} not found.`,
        );
      }

      return updatedBusiness;
    } catch (error) {
      throw new Error(`Gagal mengupdate outlets: ${error.message}`);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} business`;
  }

  async softDelete(id: string) {
    const business = await this.businessModel.findOneAndDelete({ _id: id });
    return business;
  }
}
