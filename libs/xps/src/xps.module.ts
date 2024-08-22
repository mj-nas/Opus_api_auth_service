import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { SettingModule } from 'src/modules/sql/setting/setting.module';
import xpsConfig from './xps.config';
import { XpsService } from './xps.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [xpsConfig],
    }),
    SettingModule,
    MsClientModule,
  ],
  //   controllers: [TwilioController],
  providers: [XpsService],
  exports: [XpsService],
})
export class XpsModule {}
