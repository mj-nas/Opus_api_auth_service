import { MongoModule } from '@core/mongo';
import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { Webhook, WebhookSchema } from './entities/webhook.entity';

@Module({
  imports: [
    MongoModule.register({ name: Webhook.name, schema: WebhookSchema }),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
