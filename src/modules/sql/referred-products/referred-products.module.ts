import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ReferredProductsController } from './referred-products.controller';
import { ReferredProductsService } from './referred-products.service';
import { ReferredProducts } from './entities/referred-products.entity';

@Module({
  imports: [SqlModule.register(ReferredProducts)],
  controllers: [ReferredProductsController],
  providers: [ReferredProductsService],
})
export class ReferredProductsModule {}
