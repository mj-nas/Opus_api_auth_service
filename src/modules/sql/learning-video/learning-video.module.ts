import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningModuleModule } from '../learning-module/learning-module.module';
import { LearningVideo } from './entities/learning-video.entity';
import { LearningVideoController } from './learning-video.controller';
import { LearningVideoService } from './learning-video.service';

@Module({
  imports: [SqlModule.register(LearningVideo), LearningModuleModule],
  controllers: [LearningVideoController],
  providers: [LearningVideoService],
})
export class LearningVideoModule {}
