import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import config from 'src/config';
import { uuid } from 'src/core/core.utils';
import { User } from '../../user/entities/user.entity';

@Table
export class Referral extends SqlModel {
  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  uid: string;

  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'Dispenser Id',
    example: 1,
  })
  @IsNumber()
  dispenser_id: number;

  @Column
  @ApiProperty({
    description: 'Email',
    example: 'ross.geller@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @Column(DataTypes.VIRTUAL)
  @ApiProperty({
    description: 'Referral Link',
    example:
      'https://staging.opuscompounds.com/connect/cd7c8da0-cfe0-11ee-94e2-c1e32bf24f34',
    readOnly: true,
  })
  get referral_link(): string {
    return this.getDataValue('uid')
      ? `${process.env.WEBSITE_URL}/connect/${this.getDataValue('uid')}`
      : null;
  }

  @Column
  @ApiProperty({
    description: 'QR Code',
    example: 'user/qr_code.png',
  })
  @IsOptional()
  @IsString()
  get qr_code(): string {
    return this.getDataValue('qr_code')
      ? config().cdnURL + this.getDataValue('qr_code')
      : null;
  }

  set qr_code(v: string) {
    this.setDataValue(
      'qr_code',
      typeof v === 'string' ? v.replace(config().cdnURL, '') : null,
    );
  }

  @BeforeCreate
  static setUuid(instance: Referral) {
    instance.uid = uuid();
  }

  @BeforeUpdate
  static async formatQRCode(instance: User) {
    if (instance.qr_code) {
      instance.qr_code = instance.qr_code.replace(config().cdnURL, '');
    }
  }
}
