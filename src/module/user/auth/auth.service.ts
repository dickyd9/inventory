/* eslint-disable prettier/prettier */
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { SignInDto } from '../dto/sign-in.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model } from 'mongoose';
import * as useragent from 'express-useragent';
import { ProfileUser } from '../entities/profile-user.entity';
import { UserLog } from '../entities/user-log-entity';

@Injectable()
export class AuthService {
  configService: any;
  constructor(
    private readonly userService: UserService,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('UserLog') private userLogModel: Model<UserLog>,
    @InjectModel('ProfileUser') private profileUserModel: Model<ProfileUser>,
    private jwtService: JwtService,
  ) {}
  private logger = new Logger('Sign-In');

  async validateUser(request: any, signIn: SignInDto) {
    const userAgent = useragent.parse(request.headers['user-agent']);
    const clientIp = request.ip;

    const deviceInfo = `${userAgent.os} - ${userAgent.browser}`;

    const user = await this.userService.findOne(signIn);

    this.logger.log(`${deviceInfo} - ${clientIp}`);

    if (!user) {
      throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
    }

    

    // const log = {
    //   type: 'auth',
    //   userId: user._id,
    //   detail: `${userAgent.os} - ${userAgent.browser} - ${deviceInfo} - ${clientIp}`,
    // };

    // const userLog = new this.userLogModel(log);
    // await userLog.save();


    const match = await bcrypt.compare(signIn.password, user.password);
    if (!match) {
      throw new HttpException(
        'Please check your password!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const payload = {
      sub: user._id,
      username: user.username,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async generateTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    // Simpan refreshToken di dalam model User di MongoDB
    await this.userModel.updateOne({ _id: userId }, { refreshToken });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const decodedToken = this.jwtService.decode(refreshToken) as {
      sub: string;
    };

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userModel.findById(decodedToken.sub);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }

    // Generate and return new access token
    const payload = { sub: user._id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    return accessToken;
  }

  async sendEmailPassword(email: string) {
    const userProfile = await this.profileUserModel.findOne({ email: email });
    const user = await this.userModel.findOne({ _id: userProfile.userId });

    if (!user) {
      throw new HttpException('User tidak ditemukan!', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  // async createForgottenPasswordToken(
  //   email: string,
  // ): Promise<ForgottenPassword> {
  //   const forgottenPassword = await this.forgottenPasswordModel.findOne({
  //     email: email,
  //   });
  //   if (
  //     forgottenPassword &&
  //     (new Date().getTime() - forgottenPassword.timestamp.getTime()) / 60000 <
  //       15
  //   ) {
  //     throw new HttpException(
  //       'RESET_PASSWORD.EMAIL_SENT_RECENTLY',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   } else {
  //     const forgottenPasswordModel =
  //       await this.forgottenPasswordModel.findOneAndUpdate(
  //         { email: email },
  //         {
  //           email: email,
  //           newPasswordToken: (
  //             Math.floor(Math.random() * 9000000) + 1000000
  //           ).toString(), //Generate 7 digits number,
  //           timestamp: new Date(),
  //         },
  //         { upsert: true, new: true },
  //       );
  //     if (forgottenPasswordModel) {
  //       return forgottenPasswordModel;
  //     } else {
  //       throw new HttpException(
  //         'LOGIN.ERROR.GENERIC_ERROR',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   }
  // }
}
