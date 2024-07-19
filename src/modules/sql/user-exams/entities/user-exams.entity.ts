import { SqlModel } from '@core/sql/sql.model';
import { IsUnique } from '@core/sql/sql.unique-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';
import { Column, ForeignKey, Index, Table } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@Table
export class UserExams extends SqlModel {
  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @IsNumber()
  @IsUnique('UserExams', {
    message: 'The User Id already exists. Please try with a different Id.',
  })
  user_id: number;

  @Column({ defaultValue: false })
  @ApiProperty({
    description: 'exam completed or not',
    example: true,
  })
  @IsBoolean()
  is_complete: boolean;
}
