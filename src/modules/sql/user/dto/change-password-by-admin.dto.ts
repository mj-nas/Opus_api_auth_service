import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ChangePasswordByAdminDto extends PickType(User, [
  'password',
] as const) {
  @ApiProperty({
    format: 'int32',
    description: 'User ID',
    example: 1,
  })
  id: number;
}
