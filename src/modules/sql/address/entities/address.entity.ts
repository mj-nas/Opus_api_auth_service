import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumberString, IsString, MaxLength } from 'class-validator';
import {
  BeforeSave,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@Table
export class Address extends SqlModel {
  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'User Id',
    example: 1,
    readOnly: true,
  })
  user_id: number;

  @Column
  @ApiProperty({
    description: 'First Name',
    example: 'Ross',
  })
  @IsString()
  @MaxLength(50)
  first_name: string;

  @Column
  @ApiProperty({
    description: 'Last Name',
    example: 'Geller',
  })
  @IsString()
  @MaxLength(50)
  last_name: string;

  @Column
  @ApiProperty({
    description: 'Full Name',
    example: 'Ross Geller',
    readOnly: true,
  })
  name?: string;

  @Column
  @ApiProperty({
    description: 'Email',
    example: 'ross.geller@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @Column({ type: DataType.STRING(7), defaultValue: '+1' })
  @ApiProperty({
    description: 'Phone Code',
    example: '+91',
  })
  phone_code: string;

  @Column(DataType.STRING(20))
  @ApiProperty({
    description: 'Phone',
    example: '9999999999',
  })
  @IsNumberString()
  @MaxLength(10)
  phone: string;

  @Column
  @ApiProperty({
    description: 'address',
    example: 'address',
  })
  @IsString()
  @MaxLength(100)
  address: string;

  @Column
  @ApiProperty({
    description: 'city',
    example: 'city',
  })
  @IsString()
  @MaxLength(30)
  city?: string;

  @Column
  @ApiProperty({
    description: 'state',
    example: 'state',
  })
  @IsString()
  @MaxLength(30)
  state?: string;

  @Column
  @ApiProperty({
    description: 'zip_code',
    example: 'zip_code',
  })
  @IsNumberString()
  @MaxLength(6)
  zip_code?: string;

  @BelongsTo(() => User)
  user: User;

  @BeforeSave
  static setName(instance: Address) {
    if (instance.first_name && instance.last_name) {
      instance.name = `${instance.first_name} ${instance.last_name}`;
    }
  }
}
