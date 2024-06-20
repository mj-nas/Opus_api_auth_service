import { Test, TestingModule } from '@nestjs/testing';
import { GalleryCategoryController } from './gallery-category.controller';
import { GalleryCategoryService } from './gallery-category.service';

describe('GalleryCategoryController', () => {
  let controller: GalleryCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GalleryCategoryController],
      providers: [GalleryCategoryService],
    }).compile();

    controller = module.get<GalleryCategoryController>(GalleryCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
