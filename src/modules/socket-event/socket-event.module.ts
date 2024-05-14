import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { RedisPropagatorModule } from 'src/core/modules/socket/redis-propagator/redis-propagator.module';
import { SocketEventController } from './socket-event.controller';
import { SocketEventService } from './socket-event.service';

@Module({
  imports: [MsClientModule, RedisPropagatorModule],
  controllers: [SocketEventController],
  providers: [SocketEventService],
})
export class SocketEventModule {}
