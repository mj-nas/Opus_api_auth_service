import { PickType } from '@nestjs/swagger';
import { ProductReview } from '../entities/product-review.entity';

export class CreateProductReviewDto extends PickType(ProductReview, [
  'order_id',
  'product_id',
  'rating',
  'review',
] as const) {}
