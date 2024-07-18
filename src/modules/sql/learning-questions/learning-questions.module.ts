import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningQuestionOptionsModule } from '../learning-question-options/learning-question-options.module';
import { LearningQuestions } from './entities/learning-questions.entity';
import { LearningQuestionsController } from './learning-questions.controller';
import { LearningQuestionsService } from './learning-questions.service';

@Module({
  imports: [
    SqlModule.register(LearningQuestions),
    LearningQuestionOptionsModule,
  ],
  controllers: [LearningQuestionsController],
  providers: [LearningQuestionsService],
})
export class LearningQuestionsModule {}
