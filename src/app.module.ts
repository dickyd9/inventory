import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { DatabaseModule } from './config/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionModule } from './module/transaction/transaction.module';
import { UserModule } from './module/user/user.module';
import { AuthGuard } from './module/user/auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { BusinessModule } from './module/business/business.module';
import { ItemModule } from './module/item/item.module';
import { UserBusinessModule } from './module/user-business/user-business.module';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from './module/shared/shared.module';
import { UpdateCheckMiddleware } from './common/update-check/update-check.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './common/job/job.module';
// import { HttpExceptionFilter } from './common/exception/http.exception.filter';
import { DuplicateErrorFilter } from './common/exception/duplicate.exception';
import { LogService } from './common/log/log.service';
import { ApiLoggingMiddleware } from './common/log/api-logging.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EmployeeModule } from './module/employee/employee.module';
import { CustomerModule } from './module/customer/customer.module';
import { ReportModule } from './module/report/report.module';
import { DashboardModule } from './module/dashboard/dashboard.module';
import { StorageModule } from './common/storage/storage.module';
import { ServicesModule } from './module/services/services.module';
import { PosModule } from './module/pos/pos.module';
import { MasterModule } from './module/master/master.module';
import { ExportModule } from './common/export/export.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('IS_SECRET_KEY'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    TransactionModule,
    UserModule,
    BusinessModule,
    ItemModule,
    UserBusinessModule,
    SharedModule,
    JobModule,
    EmployeeModule,
    CustomerModule,
    ReportModule,
    DashboardModule,
    StorageModule,
    ServicesModule,
    PosModule,
    MasterModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ResponseInterceptor,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: DuplicateErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    LogService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UpdateCheckMiddleware).forRoutes('items'); // Gantilah dengan rute yang sesuai
    consumer.apply(ApiLoggingMiddleware).forRoutes('*');
  }
}
