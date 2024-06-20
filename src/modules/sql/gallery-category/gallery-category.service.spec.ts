import { Test, TestingModule } from '@nestjs/testing';
import { GalleryCategoryService } from './gallery-category.service';

describe('GalleryCategoryService', () => {
  let service: GalleryCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GalleryCategoryService],
    }).compile();

    service = module.get<GalleryCategoryService>(GalleryCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
