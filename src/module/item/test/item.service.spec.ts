import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ItemService } from '../item.service';
import { SharedModule } from '../../shared/shared.module';
import { DatabaseModule } from '../../../config/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ItemSchema } from '../entities/item.entity';

describe('ItemService', () => {
  let itemService: ItemService;

  const mockItemModel = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        SharedModule,
        ConfigModule.forRoot({
          envFilePath:
            process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule], // Mengimpor ConfigModule di MongooseModule
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get('DB_URI'), // Mengambil nilai URI dari konfigurasi .env
            dbName: 'inventory',
          }),
          inject: [ConfigService], // Menginjeksi ConfigService
        }),
      ],
      providers: [
        ItemService,
        {
          provide: getModelToken('Item'),
          useValue: mockItemModel,
        },
      ],
    }).compile();

    itemService = module.get<ItemService>(ItemService);
  });

  it('should be defined', () => {
    expect(itemService).toBeDefined();
  });

  it('should create an item', async () => {
    const mockItem = {
      itemName: 'Test Item',
      itemPrice: 10,
      itemType: 'product',
      itemCategory: 'Monitor',
      itemStatus: 'open',
    };

    mockItemModel.create.mockReturnValue(mockItem);

    const result = await itemService.createItem(mockItem);

    expect(result).toEqual(mockItem);
  });

  // it('should get an item by ID', async () => {
  //   const mockItem = {
  //     _id: 'testId',
  //     itemName: 'Test Item',
  //     itemPrice: 10,
  //     itemCategory: 'Test Category',
  //   };

  //   mockItemModel.findById.mockReturnValue(mockItem);

  //   const result = await itemService.findOne('testId');

  //   expect(result).toEqual(mockItem);
  // });

  // it('should update an item', async () => {
  //   const mockItem = {
  //     _id: 'testId',
  //     itemName: 'Updated Item',
  //     itemPrice: 20,
  //     itemCategory: 'Updated Category',
  //   };

  //   mockItemModel.findByIdAndUpdate.mockReturnValue(mockItem);

  //   const result = await itemService.updateItem('testId', mockItem);

  //   expect(result).toEqual(mockItem);
  // });

  // it('should delete an item', async () => {
  //   const mockItem = {
  //     _id: 'testId',
  //     itemName: 'Test Item',
  //     itemPrice: 10,
  //     itemCategory: 'Test Category',
  //   };

  //   mockItemModel.findByIdAndRemove.mockReturnValue(mockItem);

  //   const result = await itemService.deleteItem('testId');

  //   expect(result).toEqual(mockItem);
  // });
});
