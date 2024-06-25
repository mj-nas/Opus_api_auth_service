import { Test, TestingModule } from '@nestjs/testing';
import { ReferredProductsController } from './referred-products.controller';
import { ReferredProductsService } from './referred-products.service';

describe('ReferredProductsController', () => {
  let controller: ReferredProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferredProductsController],
      providers: [ReferredProductsService],
    }).compile();

    controller = module.get<ReferredProductsController>(ReferredProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
