import { MongoDocument } from '@core/mongo';
import { defaultSchemaOptions, MongoSchema } from '@core/mongo/mongo.schema';
import { createMongoSchema } from '@core/mongo/mongo.utils';
import { Prop, Schema } from '@nestjs/mongoose';

export type WebhookDocument = MongoDocument<Webhook>;

@Schema({
  collection: 'webhook',
  ...defaultSchemaOptions,
})
export class Webhook extends MongoSchema {
  @Prop()
  app: string;

  @Prop()
  action: string;

  @Prop({ type: 'Mixed' })
  signature: any;

  @Prop({ type: 'Mixed' })
  payload: any;

  @Prop()
  status: string;
}
export const WebhookSchema = createMongoSchema(Webhook);
