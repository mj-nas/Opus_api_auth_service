import { SqlModule } from '@core/sql';
import { forwardRef, Module } from '@nestjs/common';
import { LearningModuleModule } from '../learning-module/learning-module.module';
import { LearningQuestionSet } from './entities/learning-question-set.entity';
import { LearningQuestionSetController } from './learning-question-set.controller';
import { LearningQuestionSetService } from './learning-question-set.service';

@Module({
  imports: [
    SqlModule.register(LearningQuestionSet),
    forwardRef(() => LearningModuleModule),
  ],
  controllers: [LearningQuestionSetController],
  providers: [LearningQuestionSetService],
  exports: [LearningQuestionSetService],
})
export class LearningQuestionSetModule {}
