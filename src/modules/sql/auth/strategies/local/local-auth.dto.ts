import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LocalAuthDto {
  @ApiProperty({
    description: 'Username',
    example: 'opus@mailinator.com',
  })
  @IsString()
  @IsEmail()
  username: string;

  @ApiProperty({
    description: 'Passsword',
    example: 'Admin@123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Additional session info',
    default: {},
  })
  @IsOptional()
  info: any;
}
