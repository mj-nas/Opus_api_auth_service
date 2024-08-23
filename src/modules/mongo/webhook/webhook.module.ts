import { MongoModule } from '@core/mongo';
import { StripeModule } from '@core/stripe';
import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { OrderModule } from 'src/modules/sql/order/order.module';
import { Webhook, WebhookSchema } from './entities/webhook.entity';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [
    MongoModule.register({ name: Webhook.name, schema: WebhookSchema }),
    StripeModule,
    MsClientModule,
    OrderModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
