import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ProductGalleryController } from './product-gallery.controller';
import { ProductGalleryService } from './product-gallery.service';
import { ProductGallery } from './entities/product-gallery.entity';

@Module({
  imports: [SqlModule.register(ProductGallery)],
  controllers: [ProductGalleryController],
  providers: [ProductGalleryService],
})
export class ProductGalleryModule {}
