import { OmitType } from '@nestjs/swagger';
import { LearnArticle } from '../entities/learn-article.entity';

export class CreateLearnArticleDto extends OmitType(LearnArticle, ['active'] as const) {}
