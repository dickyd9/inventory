import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import { ProfileUserDto } from './dto/profile-user.dto';
import { ProfileUser } from './entities/profile-user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRoleDto } from './dto/user-role.dto';
import { UserRole } from './entities/user-role.entity';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import 'moment/locale/id';
import { UserLog } from './entities/user-log-entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('UserLog') private userLogModel: Model<UserLog>,
    @InjectModel('ProfileUser') private profileUserModel: Model<ProfileUser>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new HttpException(
        'Confirm password not match',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userCreate = await user.save();
    if (userCreate) {
      const profile = new this.profileUserModel({ userId: userCreate._id });
      await profile.save();
    }
    return user;
  }

  async createProfile(profileUserDto: ProfileUserDto) {
    const user = new this.profileUserModel(profileUserDto);
    await user.save();
    return user;
  }

  async findAllUser(): Promise<any> {
    const users = await this.userModel
      .find()
      .select('username role gender')
      .exec();
    const result = await Promise.all(
      users.map(async (u) => {
        const profile = await this.profileUserModel
          .find({ userId: u._id })
          .select('-_id')
          .exec();

        return profile[0];
      }),
    );
    return result;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    const user = await this.profileUserModel.findOne({ userId: userId });
    const result = await user.updateOne(updateProfileDto);
    return result;
  }

  findOne(signInDto: SignInDto) {
    const user = this.userModel.findOne({ username: signInDto.username });
    return user;
  }

  async userProfile(id: string) {
    const user = await this.userModel.findById(id);
    const profile = await this.profileUserModel
      .findOne({
        userId: id,
      })
      .select('userId username firstName lastName email role gender')
      .exec();

    const result = profile;
    return result;
  }

  async findUser(username: string) {
    const user = await this.userModel.findOne({ username }).exec();
    return user;
  }

  async findUserRole(userId: string): Promise<ProfileUser> {
    const user = await this.profileUserModel.findOne({ userId: userId }).exec();
    return user;
  }

  async findUserLog(userId: string) {
    const userLog = await this.userLogModel.find({ userId: userId });

    return userLog;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async generateResetPassword(email: string) {
    const profile = await this.profileUserModel.findOne({ email: email });
    const user = await this.userModel.findOne({ _id: profile.userId });
    if (!profile) {
      throw new HttpException('Email tidak ditemukan', HttpStatus.BAD_REQUEST);
    }

    const resetToken = this.generateTokenPw(10);
    // const resetTokenExpires = new Date().toLocaleString;
    const date = new Date();
    const resetTokenExpires = moment(date).local().add(1, 'hours');

    user.tokenPassword = resetToken;
    user.tokenPasswordExpires = resetTokenExpires.toDate();

    await user.save();

    // Kirim resetToken ke pengguna (misalnya, kirim email)
    return {
      resetToken: resetToken,
      expiresIn: resetTokenExpires,
    };
  }

  async resetPassword(resetToken: string, password: any) {
    const { oldPassword, newPassword, newConfirmPassword } = password;

    const user = await this.userModel.findOne({
      tokenPassword: resetToken,
    });
    const date = moment(new Date()).local();
    if (date >= moment(user.tokenPasswordExpires)) {
      throw new HttpException(
        'Token reset tidak valid atau sudah kedaluwarsa',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newPassword !== newConfirmPassword) {
      throw new HttpException('Password not match!', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));

    const change = {
      password: hashedPassword,
      tokenPassword: null,
      tokenPasswordExpires: null,
    };

    await user.updateOne({ $set: change });

    return {
      message: 'success reset password',
    };
  }

  private generateTokenPw(length: number): string {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const randomString = buffer.toString('hex').slice(0, length);
    return randomString;
  }
}

@Injectable()
export class RoleService {
  constructor(
    @InjectModel('UserRole') private userRoleModel: Model<UserRole>,
  ) {}

  async createRole(userRoleDto: UserRoleDto) {
    const role = new this.userRoleModel(userRoleDto);
    const result = await role.save();

    return result;
  }

  async getRole() {
    const role = await this.userRoleModel.find();

    return role;
  }

  async removeRole(roleCode: string) {
    try {
      const role = await this.userRoleModel.findOneAndDelete({ roleCode });

      return role;
    } catch (error) {}
  }
}
