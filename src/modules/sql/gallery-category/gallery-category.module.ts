import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { GalleryCategoryController } from './gallery-category.controller';
import { GalleryCategoryService } from './gallery-category.service';
import { GalleryCategory } from './entities/gallery-category.entity';

@Module({
  imports: [SqlModule.register(GalleryCategory)],
  controllers: [GalleryCategoryController],
  providers: [GalleryCategoryService],
})
export class GalleryCategoryModule {}
