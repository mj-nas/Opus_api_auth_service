import { EmailModule } from '@core/email';
import { MongoModule } from '@core/mongo';
import { SqlModule } from '@core/sql';
import { StripeModule } from '@core/stripe';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CommonModule } from './modules/common.module';
import { LearningModuleModule } from './modules/sql/learning-module/learning-module.module';
import { LearningQuestionSetModule } from './modules/sql/learning-question-set/learning-question-set.module';
import { LearningQuestionsModule } from './modules/sql/learning-questions/learning-questions.module';
import { LearningQuestionOptionsModule } from './modules/sql/learning-question-options/learning-question-options.module';
import { LearningVideoModule } from './modules/sql/learning-video/learning-video.module';
import { UserExamsModule } from './modules/sql/user-exams/user-exams.module';
import { ExamModuleModule } from './modules/sql/exam-module/exam-module.module';
import { ExamVideoModule } from './modules/sql/exam-video/exam-video.module';
import { ExamQuestionSetModule } from './modules/sql/exam-question-set/exam-question-set.module';
import { ExamQuestionsModule } from './modules/sql/exam-questions/exam-questions.module';
import { ExamQuestionOptionsModule } from './modules/sql/exam-question-options/exam-question-options.module';

@Module({
  imports: [
    CoreModule,
    MongoModule.root({ seeder: true }),
    SqlModule.root({ seeder: true }),
    EmailModule,
    StripeModule,
    CommonModule.register(),
    LearningModuleModule,
    LearningQuestionSetModule,
    LearningQuestionsModule,
    LearningQuestionOptionsModule,
    LearningVideoModule,
    UserExamsModule,
    ExamModuleModule,
    ExamVideoModule,
    ExamQuestionSetModule,
    ExamQuestionsModule,
    ExamQuestionOptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
