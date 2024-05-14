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
      data: { reason: 'blocked' },
    });
    return { error: false };
  }
}
