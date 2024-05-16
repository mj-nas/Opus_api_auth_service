import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/role.enum';

export class SignupDispenserDto extends PickType(User, [
  'first_name',
  'last_name',
  'phone',
  'avatar',
  'email',
  'address',
  'city',
  'state',
  'zip_code',
] as const) {
  @ApiProperty({
    enum: Role,
    description: 'Role',
    example: Role.Dispenser,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
