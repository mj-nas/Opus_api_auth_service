import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ExamQuestionOptions } from './entities/exam-question-options.entity';
import { ExamQuestionOptionsController } from './exam-question-options.controller';
import { ExamQuestionOptionsService } from './exam-question-options.service';

@Module({
  imports: [SqlModule.register(ExamQuestionOptions)],
  controllers: [ExamQuestionOptionsController],
  providers: [ExamQuestionOptionsService],
  exports: [ExamQuestionOptionsService],
})
export class ExamQuestionOptionsModule {}
