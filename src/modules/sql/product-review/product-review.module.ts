import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewController } from './product-review.controller';
import { ProductReviewService } from './product-review.service';

@Module({
  imports: [SqlModule.register(ProductReview), MsClientModule],
  controllers: [ProductReviewController],
  providers: [ProductReviewService],
  exports: [ProductReviewService],
})
export class ProductReviewModule {}
