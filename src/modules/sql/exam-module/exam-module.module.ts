import { SqlModule } from '@core/sql';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserExamsModule } from '../user-exams/user-exams.module';
import { UserModule } from '../user/user.module';
import { ExamModule } from './entities/exam-module.entity';
import { ExamModuleController } from './exam-module.controller';
import { ExamModuleService } from './exam-module.service';

@Module({
  imports: [
    SqlModule.register(ExamModule),
    forwardRef(() => UserExamsModule),
    UserModule,
    ConfigModule,
  ],
  controllers: [ExamModuleController],
  providers: [ExamModuleService],
  exports: [ExamModuleService],
})
export class ExamModuleModule {}
