import { Test, TestingModule } from '@nestjs/testing';
import { UserBusinessService } from './user-business.service';

describe('UserBusinessService', () => {
  let service: UserBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserBusinessService],
    }).compile();

    service = module.get<UserBusinessService>(UserBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
