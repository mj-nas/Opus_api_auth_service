import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { UserDispenser } from './entities/user-dispenser.entity';
import { UserDispenserController } from './user-dispenser.controller';
import { UserDispenserService } from './user-dispenser.service';

@Module({
  imports: [SqlModule.register(UserDispenser), MsClientModule],
  controllers: [UserDispenserController],
  providers: [UserDispenserService],
})
export class UserDispenserModule {}
