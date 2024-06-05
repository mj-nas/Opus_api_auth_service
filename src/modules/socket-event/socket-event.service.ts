import { Injectable } from '@nestjs/common';
import { Job } from 'src/core/core.job';
import { RedisPropagatorService } from 'src/core/modules/socket/redis-propagator/redis-propagator.service';
import { SocketEvent } from './socket-event.enum';

@Injectable()
export class SocketEventService {
  constructor(private redisPropagatorService: RedisPropagatorService) {}

  async userBlocked(job: Job) {
    this.redisPropagatorService.propagateEvent({
      userId: `${job.payload.user_id}`,
      event: SocketEvent.Logout,
      data: { reason: 'account_blocked' },
    });
    return { error: false };
  }

  async userDeleted(job: Job) {
    this.redisPropagatorService.propagateEvent({
      userId: `${job.payload.user_id}`,
      event: SocketEvent.Logout,
      data: { reason: 'account_deleted' },
    });
    return { error: false };
  }

  async orderPlaced(job: Job) {
    this.redisPropagatorService.propagateEvent({
      userId: `${job.payload.user_id}`,
      event: SocketEvent.OrderPlaced,
      data: { ...job.payload.data, reason: 'Order Placed' },
    });
    return { error: false };
  }

  async orderStatusChange(job: Job) {
    this.redisPropagatorService.propagateEvent({
      userId: `${job.payload.user_id}`,
      event: SocketEvent.OrderStatusUpdate,
      data: { ...job.payload.data, reason: 'Order status updated' },
    });
    return { error: false };
  }
}
