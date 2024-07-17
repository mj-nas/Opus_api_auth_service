import { OmitType } from '@nestjs/swagger';
import { LearningModule } from '../entities/learning-module.entity';

export class CreateLearningModuleDto extends OmitType(LearningModule, ['active'] as const) {}
