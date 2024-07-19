import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ExamModuleModule } from '../exam-module/exam-module.module';
import { ExamQuestionOptionsModule } from '../exam-question-options/exam-question-options.module';
import { ExamQuestionSetModule } from '../exam-question-set/exam-question-set.module';
import { ExamQuestionsModule } from '../exam-questions/exam-questions.module';
import { ExamVideoModule } from '../exam-video/exam-video.module';
import { LearningModuleModule } from '../learning-module/learning-module.module';
import { UserExams } from './entities/user-exams.entity';
import { UserExamsController } from './user-exams.controller';
import { UserExamsService } from './user-exams.service';

@Module({
  imports: [
    SqlModule.register(UserExams),
    LearningModuleModule,
    ExamModuleModule,
    ExamVideoModule,
    ExamQuestionSetModule,
    ExamQuestionsModule,
    ExamQuestionOptionsModule,
  ],
  controllers: [UserExamsController],
  providers: [UserExamsService],
})
export class UserExamsModule {}
