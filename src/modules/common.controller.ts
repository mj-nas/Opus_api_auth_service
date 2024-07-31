import { XpsService } from '@core/xps';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ApiErrorResponses } from 'src/core/core.decorators';
import { Job } from 'src/core/core.job';
import { ErrorResponse, Result } from 'src/core/core.responses';
import { Public } from 'src/core/decorators/public.decorator';
import { CommonService } from './common.service';
import { CreatePresignedUrl } from './create-presigned-url.dto';

@ApiTags('common')
@ApiBearerAuth()
@ApiErrorResponses()
@Controller('common')
export class CommonController {
  constructor(
    private commonService: CommonService,
    private _xpsService: XpsService,
  ) {}

  @Post('presigned-url')
  @Public()
  @ApiOperation({ summary: 'To create presigned url for s3' })
  async putObject(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createPresignedUrl: CreatePresignedUrl,
  ) {
    const { error, signedUrl } = await this.commonService.getSignedURL(
      new Job({
        payload: {
          operation: 'putObject',
          params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: createPresignedUrl.key,
            Expires: 60 * 60 * 36,
            region: process.env.AWS_REGION,
          },
        },
      }),
    );
    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { signed_url: signedUrl },
      message: 'Ok',
    });
  }
}
