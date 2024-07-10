import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { Gallery } from './entities/gallery.entity';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  imports: [SqlModule.register(Gallery)],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
