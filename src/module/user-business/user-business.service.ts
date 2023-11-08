import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserBusinessDto } from './dto/create-user-business.dto';
import { UpdateUserBusinessDto } from './dto/update-user-business.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/entities/user.entity';
import { UserBusiness } from './entities/user-business.entity';
import { Business } from '../business/entities/business.entity';
import { ProfileUser } from '../user/entities/profile-user.entity';

@Injectable()
export class UserBusinessService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Profile') private userProfileModel: Model<ProfileUser>,
    @InjectModel('Business') private businessModel: Model<Business>,
    @InjectModel('UserBusiness') private userBusinessModel: Model<UserBusiness>,
  ) {}

  async createUserBusiness(payload: object) {
    const userBusiness = new this.userBusinessModel(payload);
    await userBusiness.save();
    return {
      message: 'User business has created!',
    };
  }

  async findAll() {
    const userB = await this.userBusinessModel.find().exec();
    return userB;
  }

  async findOne(userId: string, businessCode: string) {
    // const userBusiness = await this.userBusinessModel.findOne({
    //   userId: userId,
    // });
    // if (!userBusiness) {
    //   throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    // }
    // const business = await this.businessModel.findOne({
    //   businessCode: businessCode,
    // });
    const user = await this.userModel.find({ _id: userId });
    const userProfile = await this.userProfileModel.find();
    // const result = {
    //   user,
    //   business: business,
    // };
    return userProfile;
    // return `This action returns a #${id} userBusiness`;
  }

  update(id: number, updateUserBusinessDto: UpdateUserBusinessDto) {
    return `This action updates a #${id} userBusiness`;
  }

  remove(id: number) {
    return `This action removes a #${id} userBusiness`;
  }
}
