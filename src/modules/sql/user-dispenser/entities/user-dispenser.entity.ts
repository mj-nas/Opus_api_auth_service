import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import {
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { ConnectionVia } from '../../user/connection-via.enum';
import { User } from '../../user/entities/user.entity';

@Table
export class UserDispenser extends SqlModel {
  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'User Id',
    example: 1,
    readOnly: true,
  })
  @IsNumber()
  user_id: number;

  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'Previous Dispenser Id',
    example: 1,
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  previous_dispenser_id: number;

  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'Dispenser Id',
    example: 1,
    readOnly: true,
  })
  @IsNumber()
  dispenser_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(ConnectionVia)),
  })
  @ApiProperty({
    enum: ConnectionVia,
    description: 'ConnectionVia',
    example: ConnectionVia.Coupon,
  })
  @IsEnum(ConnectionVia)
  connection_via?: ConnectionVia;
}
