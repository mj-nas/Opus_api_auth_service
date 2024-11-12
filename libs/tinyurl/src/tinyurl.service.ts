import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Job, JobResponse } from 'src/core/core.job';

// Api documentation https://tinyurl.com/app/dev

@Injectable()
export class TinyUrlService {
  public constructor(private _config: ConfigService) {}

  async shortenUrl(job: Job): Promise<JobResponse> {
    try {
      const response = await axios.post(
        `${this._config.get('tinyUrl').api_url}/create`,
        { ...job.payload },
        {
          headers: {
            Authorization: `Bearer ${this._config.get('tinyUrl').api_key}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.errors && response.data.errors.length > 0)
        return { error: response.data.errors.join(', ') };

      // Return the shortened URL from the response
      return { data: response.data.data };
    } catch (error) {
      return { error: error.message || 'Failed to shorten URL' };
    }
  }
}
