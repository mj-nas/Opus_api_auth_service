import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningQuestionsController } from './learning-questions.controller';
import { LearningQuestionsService } from './learning-questions.service';
import { LearningQuestions } from './entities/learning-questions.entity';

@Module({
  imports: [SqlModule.register(LearningQuestions)],
  controllers: [LearningQuestionsController],
  providers: [LearningQuestionsService],
})
export class LearningQuestionsModule {}
