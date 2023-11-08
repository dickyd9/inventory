import { Test, TestingModule } from '@nestjs/testing';
import { UserBusinessController } from './user-business.controller';
import { UserBusinessService } from './user-business.service';

describe('UserBusinessController', () => {
  let controller: UserBusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBusinessController],
      providers: [UserBusinessService],
    }).compile();

    controller = module.get<UserBusinessController>(UserBusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
