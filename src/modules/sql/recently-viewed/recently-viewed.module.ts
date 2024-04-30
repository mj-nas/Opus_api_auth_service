import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { RecentlyViewedController } from './recently-viewed.controller';
import { RecentlyViewedService } from './recently-viewed.service';
import { RecentlyViewed } from './entities/recently-viewed.entity';

@Module({
  imports: [SqlModule.register(RecentlyViewed)],
  controllers: [RecentlyViewedController],
  providers: [RecentlyViewedService],
})
export class RecentlyViewedModule {}
