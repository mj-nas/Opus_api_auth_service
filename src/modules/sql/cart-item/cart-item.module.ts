import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { CartItemController } from './cart-item.controller';
import { CartItemService } from './cart-item.service';
import { CartItem } from './entities/cart-item.entity';

@Module({
  imports: [SqlModule.register(CartItem)],
  controllers: [CartItemController],
  providers: [CartItemService],
  exports: [CartItemService],
})
export class CartItemModule {}
