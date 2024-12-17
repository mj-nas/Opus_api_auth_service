import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class SignupDto extends PickType(User, [
  'first_name',
  'last_name',
  'phone',
  'password',
  'avatar',
  'email',
  'address',
  'address2',
  'latitude',
  'longitude',
  'city',
  'state',
  'zip_code',
  'role',
] as const) {
  @ApiProperty({
    description: 'Additional session info',
    default: {},
  })
  @IsOptional()
  info: any;
}
