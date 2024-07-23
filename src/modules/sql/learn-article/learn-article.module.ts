import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearnArticle } from './entities/learn-article.entity';
import { LearnArticleController } from './learn-article.controller';
import { LearnArticleService } from './learn-article.service';

@Module({
  imports: [SqlModule.register(LearnArticle)],
  controllers: [LearnArticleController],
  providers: [LearnArticleService],
  exports: [LearnArticleService],
})
export class LearnArticleModule {}
