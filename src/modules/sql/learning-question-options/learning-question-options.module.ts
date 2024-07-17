import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningQuestionOptionsController } from './learning-question-options.controller';
import { LearningQuestionOptionsService } from './learning-question-options.service';
import { LearningQuestionOptions } from './entities/learning-question-options.entity';

@Module({
  imports: [SqlModule.register(LearningQuestionOptions)],
  controllers: [LearningQuestionOptionsController],
  providers: [LearningQuestionOptionsService],
})
export class LearningQuestionOptionsModule {}
