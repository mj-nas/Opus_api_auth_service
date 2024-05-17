import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { OrderAddress } from './entities/order-address.entity';
import { OrderAddressController } from './order-address.controller';
import { OrderAddressService } from './order-address.service';

@Module({
  imports: [SqlModule.register(OrderAddress), MsClientModule],
  controllers: [OrderAddressController],
  providers: [OrderAddressService],
  exports: [OrderAddressService],
})
export class OrderAddressModule {}
