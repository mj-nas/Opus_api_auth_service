import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ExamVideo } from './entities/exam-video.entity';
import { ExamVideoController } from './exam-video.controller';
import { ExamVideoService } from './exam-video.service';

@Module({
  imports: [SqlModule.register(ExamVideo)],
  controllers: [ExamVideoController],
  providers: [ExamVideoService],
  exports: [ExamVideoService],
})
export class ExamVideoModule {}
