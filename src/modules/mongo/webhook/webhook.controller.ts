import { Body, Controller, Post, Res } from '@nestjs/common';
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
    const sig = res.getHeader('stripe-signature');
    const { error } = await this.webhookService.create({
      action: 'checkout.session.completed',
      body: {
        payload: body,
        signature: sig,
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
