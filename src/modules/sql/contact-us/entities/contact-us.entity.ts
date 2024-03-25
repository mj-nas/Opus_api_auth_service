import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import {
  BeforeSave,
  Column,
  DataType,
  Index,
  Table,
} from 'sequelize-typescript';

@Table
export class ContactUs extends SqlModel {
  @Column
  @ApiProperty({
    description: 'First Name',
    example: 'John',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  first_name: string;

  @Column
  @ApiProperty({
    description: 'Last Name',
    example: 'Wilkins',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  last_name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Full Name',
    example: 'John Wilkins',
    readOnly: true,
  })
  name?: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Email',
    example: 'john.wilkins@mailinator.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @Column({
    type: DataType.STRING(512),
  })
  @ApiProperty({
    description: 'Message',
    example:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  message: string;

  @BeforeSave
  static setName(instance: ContactUs) {
    if (instance.first_name && instance.last_name) {
      instance.name = `${instance.first_name} ${instance.last_name}`;
    }
  }
}
