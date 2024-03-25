import { OmitType, PartialType } from '@nestjs/swagger';
import { LearnYoutube } from '../entities/learn-youtube.entity';

export class UpdateLearnYoutubeDto extends PartialType(
  OmitType(LearnYoutube, [] as const),
) {}
