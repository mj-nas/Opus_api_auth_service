import { OmitType, PartialType } from '@nestjs/swagger';
import { LearningModule } from '../entities/learning-module.entity';

export class UpdateLearningModuleDto extends PartialType(
  OmitType(LearningModule, [] as const),
) {}
