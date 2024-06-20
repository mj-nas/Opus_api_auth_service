import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Gallery } from './entities/gallery.entity';

@Module({
  imports: [SqlModule.register(Gallery)],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
