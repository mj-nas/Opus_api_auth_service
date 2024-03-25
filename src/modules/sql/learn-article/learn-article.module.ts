import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearnArticleController } from './learn-article.controller';
import { LearnArticleService } from './learn-article.service';
import { LearnArticle } from './entities/learn-article.entity';

@Module({
  imports: [SqlModule.register(LearnArticle)],
  controllers: [LearnArticleController],
  providers: [LearnArticleService],
})
export class LearnArticleModule {}
