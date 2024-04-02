import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import twilioConfig from './twilio.config';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [twilioConfig],
    }),
    MsClientModule,
  ],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
