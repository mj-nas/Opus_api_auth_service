import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearnYoutube } from './entities/learn-youtube.entity';
import { LearnYoutubeController } from './learn-youtube.controller';
import { LearnYoutubeService } from './learn-youtube.service';

@Module({
  imports: [SqlModule.register(LearnYoutube)],
  controllers: [LearnYoutubeController],
  providers: [LearnYoutubeService],
  exports: [LearnYoutubeService],
})
export class LearnYoutubeModule {}
