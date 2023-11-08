import { Module } from '@nestjs/common';
import { RoleService, UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
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
    SharedModule,
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, RoleService, AuthService],
})
export class UserModule {}
