import { Test, TestingModule } from '@nestjs/testing';
import { ProductGalleryController } from './product-gallery.controller';
import { ProductGalleryService } from './product-gallery.service';

describe('ProductGalleryController', () => {
  let controller: ProductGalleryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductGalleryController],
      providers: [ProductGalleryService],
    }).compile();

    controller = module.get<ProductGalleryController>(ProductGalleryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
