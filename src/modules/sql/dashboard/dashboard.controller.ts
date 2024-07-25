import { Controller, Get, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiErrorResponses } from 'src/core/core.decorators';
import { Result } from 'src/core/core.responses';
import { DashboardService } from './dashboard.service';

@ApiBearerAuth()
@ApiErrorResponses()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // write a get api
  @Get()
  @ApiOperation({ summary: `Get counts for dashboard` })
  async getCounts(@Res() res: Response) {
    const dashboardCounts = await this.dashboardService.getCounts();
    if (!dashboardCounts) {
      return Result(res, { error: 'No data found' });
    }

    return Result(res, { data: { counts: dashboardCounts } });
  }
}
