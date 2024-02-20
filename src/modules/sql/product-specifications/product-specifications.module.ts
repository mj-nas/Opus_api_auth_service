import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ProductSpecificationsController } from './product-specifications.controller';
import { ProductSpecificationsService } from './product-specifications.service';
import { ProductSpecifications } from './entities/product-specifications.entity';

@Module({
  imports: [SqlModule.register(ProductSpecifications)],
  controllers: [ProductSpecificationsController],
  providers: [ProductSpecificationsService],
})
export class ProductSpecificationsModule {}
