import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ExamQuestions } from './entities/exam-questions.entity';
import { ExamQuestionsController } from './exam-questions.controller';
import { ExamQuestionsService } from './exam-questions.service';

@Module({
  imports: [SqlModule.register(ExamQuestions)],
  controllers: [ExamQuestionsController],
  providers: [ExamQuestionsService],
  exports: [ExamQuestionsService],
})
export class ExamQuestionsModule {}
