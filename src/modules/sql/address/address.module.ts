import { SqlModule } from '@core/sql';
import { forwardRef, Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SqlModule.register(Address),
    MsClientModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
