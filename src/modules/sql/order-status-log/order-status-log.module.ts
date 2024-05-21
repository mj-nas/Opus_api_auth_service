import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { OrderStatusLog } from './entities/order-status-log.entity';
import { OrderStatusLogController } from './order-status-log.controller';
import { OrderStatusLogService } from './order-status-log.service';

@Module({
  imports: [SqlModule.register(OrderStatusLog)],
  controllers: [OrderStatusLogController],
  providers: [OrderStatusLogService],
  exports: [OrderStatusLogService],
})
export class OrderStatusLogModule {}
