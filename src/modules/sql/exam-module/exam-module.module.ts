import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ExamModule } from './entities/exam-module.entity';
import { ExamModuleController } from './exam-module.controller';
import { ExamModuleService } from './exam-module.service';

@Module({
  imports: [SqlModule.register(ExamModule)],
  controllers: [ExamModuleController],
  providers: [ExamModuleService],
  exports: [ExamModuleService],
})
export class ExamModuleModule {}
