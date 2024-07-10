import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { GalleryModule } from '../gallery/gallery.module';
import { GalleryCategory } from './entities/gallery-category.entity';
import { GalleryCategoryController } from './gallery-category.controller';
import { GalleryCategoryService } from './gallery-category.service';

@Module({
  imports: [SqlModule.register(GalleryCategory), GalleryModule],
  controllers: [GalleryCategoryController],
  providers: [GalleryCategoryService],
})
export class GalleryCategoryModule {}
