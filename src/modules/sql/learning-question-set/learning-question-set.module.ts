import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningQuestionSetController } from './learning-question-set.controller';
import { LearningQuestionSetService } from './learning-question-set.service';
import { LearningQuestionSet } from './entities/learning-question-set.entity';

@Module({
  imports: [SqlModule.register(LearningQuestionSet)],
  controllers: [LearningQuestionSetController],
  providers: [LearningQuestionSetService],
})
export class LearningQuestionSetModule {}
