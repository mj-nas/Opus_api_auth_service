import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { LearnYoutubeController } from './learn-youtube.controller';
import { LearnYoutubeService } from './learn-youtube.service';
import { LearnYoutube } from './entities/learn-youtube.entity';

@Module({
  imports: [SqlModule.register(LearnYoutube)],
  controllers: [LearnYoutubeController],
  providers: [LearnYoutubeService],
})
export class LearnYoutubeModule {}
