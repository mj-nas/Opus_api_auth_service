import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { Commission } from './entities/commission.entity';

@Module({
  imports: [SqlModule.register(Commission), OrderModule],
  controllers: [CommissionController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
