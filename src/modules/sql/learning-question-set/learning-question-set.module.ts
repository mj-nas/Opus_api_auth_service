import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningQuestionSet } from './entities/learning-question-set.entity';
import { LearningQuestionSetController } from './learning-question-set.controller';
import { LearningQuestionSetService } from './learning-question-set.service';

@Module({
  imports: [SqlModule.register(LearningQuestionSet)],
  controllers: [LearningQuestionSetController],
  providers: [LearningQuestionSetService],
  exports: [LearningQuestionSetService],
})
export class LearningQuestionSetModule {}
