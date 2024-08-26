import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiErrorResponses, ResponseCreated } from 'src/core/core.decorators';
import { Created, ErrorResponse } from 'src/core/core.responses';
import { snakeCase } from 'src/core/core.utils';
import { Public } from 'src/core/decorators/public.decorator';
import { Webhook } from './entities/webhook.entity';
import { WebhookService } from './webhook.service';

const entity = snakeCase(Webhook.name);

@ApiTags(entity)
@Public()
@ApiErrorResponses()
@ApiExtraModels(Webhook)
@Controller(entity)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Create a new entity document
   */
  @Post('stripe/checkout-session-completed')
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(Webhook)
  async create(@Res() res: Response, @Body() body: any) {
    const { error } = await this.webhookService.create({
      action: 'checkout.session.completed',
      body: {
        payload: body,
      },
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { message: 'Created' });
  }

  /**
   * Create a new entity document
   */
  @Get('xps/order-sample')
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(Webhook)
  async sampleWebhook(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: any,
  ) {
    return Created(res, { orders: [], message: 'Created' });
  }

  /**
   * Create a new entity document
   */
  @Post('xps/order-update')
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(Webhook)
  async orderStatus(
    @Res() res: Response,
    @Req() req: Request,
    @Param() id: string,
    @Query() query: any,
    @Body() body: any,
  ) {
    const { error } = await this.webhookService.create({
      action: 'xps.order.update',
      body: {
        payload: { body: body, query: query },
      },
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { message: 'Created' });
  }
}
