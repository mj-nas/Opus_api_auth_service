import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearningVideoController } from './learning-video.controller';
import { LearningVideoService } from './learning-video.service';
import { LearningVideo } from './entities/learning-video.entity';

@Module({
  imports: [SqlModule.register(LearningVideo)],
  controllers: [LearningVideoController],
  providers: [LearningVideoService],
})
export class LearningVideoModule {}
