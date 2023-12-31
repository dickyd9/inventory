import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Mengimpor ConfigModule di MongooseModule
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DB_URI'), // Mengambil nilai URI dari konfigurasi .env
        dbName: 'nova-beaty-salon-db',
      }),
      inject: [ConfigService], // Menginjeksi ConfigService
    }),
  ],
})
export class DatabaseModule {}
