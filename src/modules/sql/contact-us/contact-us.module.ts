import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { SettingModule } from '../setting/setting.module';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { ContactUs } from './entities/contact-us.entity';

@Module({
  imports: [SqlModule.register(ContactUs), NotificationModule, SettingModule],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
