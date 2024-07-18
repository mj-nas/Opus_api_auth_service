import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { LearningQuestionOptions } from '../../learning-question-options/entities/learning-question-options.entity';
import { LearningQuestions } from '../entities/learning-questions.entity';

export class CreateLearningQuestionsOptionsDto extends OmitType(
  LearningQuestions,
  ['active'] as const,
) {
  @ApiProperty({
    format: 'int32',
    description: 'User ID',
    example: [
      { option: 'answer1', is_correct: false },
      { option: 'answer2', is_correct: true },
    ],
  })
  @IsArray()
  options: LearningQuestionOptions[];
}
