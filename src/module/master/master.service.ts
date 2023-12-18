import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServicesCategory } from '../services/entities/service.category.entity';

@Injectable()
export class MasterService {
  constructor(
    @InjectModel('ServicesCategory')
    private modelServicesCategory: Model<ServicesCategory>,
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
}
