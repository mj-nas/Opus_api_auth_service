import { Test, TestingModule } from '@nestjs/testing';
import { ProductGalleryService } from './product-gallery.service';

describe('ProductGalleryService', () => {
  let service: ProductGalleryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductGalleryService],
    }).compile();

    service = module.get<ProductGalleryService>(ProductGalleryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
