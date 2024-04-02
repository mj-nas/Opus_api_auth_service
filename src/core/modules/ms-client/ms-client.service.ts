import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Job, JobResponse } from 'src/core/core.job';
import { JobLogService } from 'src/modules/mongo/job-log/job-log.service';

@Injectable()
export class MsClientService {
  constructor(
    @Inject('WORKER_SERVICE') private readonly client: ClientProxy,
    private readonly jobLogService: JobLogService,
  ) {}

  async executeJob(queue: string, job: Job): Promise<JobResponse> {
    try {
      if (!(job instanceof Job)) {
        job = new Job(job);
      }
      if (job.logging !== false) {
        const { error, data } = await this.jobLogService.create({
          body: { ...JSON.parse(JSON.stringify(job)), queue },
        });
        if (error) throw error;
        job.uid = data._id.toString();
        this.client.emit(queue, job);
        return { data };
      } else {
        this.client.emit(queue, job);
        return { data: job };
      }
    } catch (error) {
      return { error };
    }
  }

  async jobDone(job: Job, response: JobResponse): Promise<void> {
    try {
      job.status = response.error ? 'Errored' : 'Completed';
      if (job.logging !== false) {
        await this.jobLogService.update({
          id: job.uid,
          body: {
            status: job.status,
            response: JSON.parse(JSON.stringify(response)),
          },
        });
      }
    } catch (error) {}
  }

  async jobDoneMulti(job: Job, response: JobResponse): Promise<void> {
    try {
      job.status = response.error ? 'Errored' : 'Completed';
      if (job.logging !== false) {
        const { error, data: jobLog } = await this.jobLogService.findById({
          id: job.uid,
          body: {
            status: job.status,
            response: JSON.parse(JSON.stringify(response)),
          },
        });

        if (error) {
          console.log(error);
          return;
        }

        jobLog.status = jobLog.status === 'Errored' ? 'Errored' : job.status;
        jobLog.response = jobLog.response || [];
        jobLog.response.push(JSON.parse(JSON.stringify(response)));
        await jobLog.save();
      }
    } catch (error) {}
  }
}
