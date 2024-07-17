import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningModuleController } from './learning-module.controller';
import { LearningModuleService } from './learning-module.service';
import { LearningModule } from './entities/learning-module.entity';

@Module({
  imports: [SqlModule.register(LearningModule)],
  controllers: [LearningModuleController],
  providers: [LearningModuleService],
})
export class LearningModuleModule {}
