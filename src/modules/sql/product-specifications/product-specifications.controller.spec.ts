import { Test, TestingModule } from '@nestjs/testing';
import { ProductSpecificationsController } from './product-specifications.controller';
import { ProductSpecificationsService } from './product-specifications.service';

describe('ProductSpecificationsController', () => {
  let controller: ProductSpecificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSpecificationsController],
      providers: [ProductSpecificationsService],
    }).compile();

    controller = module.get<ProductSpecificationsController>(ProductSpecificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
