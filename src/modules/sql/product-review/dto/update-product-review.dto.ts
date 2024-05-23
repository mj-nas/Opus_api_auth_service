import { PartialType, PickType } from '@nestjs/swagger';
import { ProductReview } from '../entities/product-review.entity';

export class UpdateProductReviewDto extends PartialType(
  PickType(ProductReview, ['rating', 'review'] as const),
) {}
