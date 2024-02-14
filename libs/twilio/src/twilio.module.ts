import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import twilioConfig from './twilio.config';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [twilioConfig],
    }),
  ],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
