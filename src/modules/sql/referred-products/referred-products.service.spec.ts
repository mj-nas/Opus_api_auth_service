import { Test, TestingModule } from '@nestjs/testing';
import { ReferredProductsService } from './referred-products.service';

describe('ReferredProductsService', () => {
  let service: ReferredProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferredProductsService],
    }).compile();

    service = module.get<ReferredProductsService>(ReferredProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
