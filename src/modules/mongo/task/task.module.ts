import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { isPrimaryInstance } from 'src/core/core.utils';
import { CommissionModule } from 'src/modules/sql/commission/commission.module';
import { OrderModule } from 'src/modules/sql/order/order.module';
import { MongoModule } from '../../../../libs/mongo/src';
import { HistoryModule } from './../history/history.module';
import { TrashModule } from './../trash/trash.module';
import { CommissionCron } from './crons/commission.cron';
import { HistoryCron } from './crons/history.cron';
import { OrderCron } from './crons/order.cron';
import { TrashCron } from './crons/trash.cron';
import { Task, TaskSchema } from './entities/task.entity';
import { TaskService } from './task.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HistoryModule,
    TrashModule,
    OrderModule,
    CommissionModule,
    ConfigModule,
    MongoModule.register({ name: Task.name, schema: TaskSchema }),
  ],
  providers: [TaskService, HistoryCron, TrashCron, OrderCron, CommissionCron],
})
export class TaskModule implements OnApplicationBootstrap {
  constructor(private taskService: TaskService) {}
  async onApplicationBootstrap() {
    if (isPrimaryInstance()) {
      await this.taskService.initCrons();
    }
  }
}
