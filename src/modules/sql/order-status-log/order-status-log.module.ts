import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { OrderStatusLog } from './entities/order-status-log.entity';
import { OrderStatusLogController } from './order-status-log.controller';
import { OrderStatusLogService } from './order-status-log.service';

@Module({
  imports: [SqlModule.register(OrderStatusLog), MsClientModule],
  controllers: [OrderStatusLogController],
  providers: [OrderStatusLogService],
  exports: [OrderStatusLogService],
})
export class OrderStatusLogModule {}
