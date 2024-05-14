import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [SqlModule.register(Cart)],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
