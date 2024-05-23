import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ProductReviewController } from './product-review.controller';
import { ProductReviewService } from './product-review.service';
import { ProductReview } from './entities/product-review.entity';

@Module({
  imports: [SqlModule.register(ProductReview)],
  controllers: [ProductReviewController],
  providers: [ProductReviewService],
})
export class ProductReviewModule {}
