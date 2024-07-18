import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningQuestionSetModule } from '../learning-question-set/learning-question-set.module';
import { LearningModule } from './entities/learning-module.entity';
import { LearningModuleController } from './learning-module.controller';
import { LearningModuleService } from './learning-module.service';

@Module({
  imports: [SqlModule.register(LearningModule), LearningQuestionSetModule],
  controllers: [LearningModuleController],
  providers: [LearningModuleService],
  exports: [LearningModuleService],
})
export class LearningModuleModule {}
