import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ExamQuestionSet } from './entities/exam-question-set.entity';
import { ExamQuestionSetController } from './exam-question-set.controller';
import { ExamQuestionSetService } from './exam-question-set.service';

@Module({
  imports: [SqlModule.register(ExamQuestionSet)],
  controllers: [ExamQuestionSetController],
  providers: [ExamQuestionSetService],
  exports: [ExamQuestionSetService],
})
export class ExamQuestionSetModule {}
