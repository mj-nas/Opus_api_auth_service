import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { Wishlist } from './entities/wishlist.entity';

@Module({
  imports: [SqlModule.register(Wishlist)],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
