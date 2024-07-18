import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningQuestionOptions } from './entities/learning-question-options.entity';
import { LearningQuestionOptionsController } from './learning-question-options.controller';
import { LearningQuestionOptionsService } from './learning-question-options.service';

@Module({
  imports: [SqlModule.register(LearningQuestionOptions)],
  controllers: [LearningQuestionOptionsController],
  providers: [LearningQuestionOptionsService],
  exports: [LearningQuestionOptionsService],
})
export class LearningQuestionOptionsModule {}
