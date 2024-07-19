import { OmitType } from '@nestjs/swagger';
import { ExamVideo } from '../entities/exam-video.entity';

export class CreateExamVideoDto extends OmitType(ExamVideo, ['active'] as const) {}
