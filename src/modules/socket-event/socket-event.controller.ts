import { Controller } from '@nestjs/common';
import { MsListener } from 'src/core/core.decorators';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from '../../core/modules/ms-client/ms-client.service';
import { SocketEventService } from './socket-event.service';

@Controller('socket')
export class SocketEventController {
  constructor(
    private readonly socketEventService: SocketEventService,
    private client: MsClientService,
  ) {}

  /**
   * Queue listener for SocketEvent
   */
  @MsListener(`controller.socket-event`)
  async execute(job: Job): Promise<void> {
    const response = await this.socketEventService[job.action]<JobResponse>(
      new Job(job),
    );
    await this.client.jobDone(job, response);
  }
}
