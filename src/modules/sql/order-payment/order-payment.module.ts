import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { OrderPayment } from './entities/order-payment.entity';
import { OrderPaymentController } from './order-payment.controller';
import { OrderPaymentService } from './order-payment.service';

@Module({
  imports: [SqlModule.register(OrderPayment), MsClientModule],
  controllers: [OrderPaymentController],
  providers: [OrderPaymentService],
  exports: [OrderPaymentService],
})
export class OrderPaymentModule {}
