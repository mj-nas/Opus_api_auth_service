import { OmitType } from '@nestjs/swagger';
import { LearnYoutube } from '../entities/learn-youtube.entity';

export class CreateLearnYoutubeDto extends OmitType(LearnYoutube, ['active'] as const) {}
