import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { User } from '../entities/user.entity';

export class ChangePasswordByAdminDto extends PickType(User, [
  'password',
] as const) {
  @ApiProperty({
    format: 'int32',
    description: 'User ID',
    example: 1,
  })
  @IsNumber()
  user_id: number;
}
