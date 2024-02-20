import { Test, TestingModule } from '@nestjs/testing';
import { ProductSpecificationsService } from './product-specifications.service';

describe('ProductSpecificationsService', () => {
  let service: ProductSpecificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSpecificationsService],
    }).compile();

    service = module.get<ProductSpecificationsService>(ProductSpecificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
