import { OmitType, PartialType } from '@nestjs/swagger';
import { LearnArticle } from '../entities/learn-article.entity';

export class UpdateLearnArticleDto extends PartialType(
  OmitType(LearnArticle, [] as const),
) {}
