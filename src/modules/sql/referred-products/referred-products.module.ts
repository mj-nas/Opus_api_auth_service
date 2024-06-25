import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ReferredProducts } from './entities/referred-products.entity';
import { ReferredProductsController } from './referred-products.controller';
import { ReferredProductsService } from './referred-products.service';

@Module({
  imports: [SqlModule.register(ReferredProducts)],
  controllers: [ReferredProductsController],
  providers: [ReferredProductsService],
  exports: [ReferredProductsService],
})
export class ReferredProductsModule {}
