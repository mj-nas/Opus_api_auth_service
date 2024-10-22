import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { CmsHomeController } from './cms-home.controller';
import { CmsHomeService } from './cms-home.service';
import { CmsHome } from './entities/cms-home.entity';

@Module({
  imports: [SqlModule.register(CmsHome)],
  controllers: [CmsHomeController],
  providers: [CmsHomeService],
})
export class CmsHomeModule {}
