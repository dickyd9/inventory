import { Module } from '@nestjs/common';
import { UserBusinessService } from './user-business.service';
import { UserBusinessController } from './user-business.controller';
import { SharedModule } from '../shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserBusinessSchema } from './entities/user-business.entity';
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    SharedModule,
    
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('IS_SECRET_KEY'),
        signOptions: { expiresIn: '12h' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'UserBusiness', schema: UserBusinessSchema },
    ]),
  ],
  controllers: [UserBusinessController],
  providers: [UserBusinessService],
})
export class UserBusinessModule {}
