import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import tinyUrlConfig from './tinyurl.config';
import { TinyUrlService } from './tinyurl.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [tinyUrlConfig],
    }),
  ],
  providers: [TinyUrlService],
  exports: [TinyUrlService],
})
export class TinyUrlModule {}
