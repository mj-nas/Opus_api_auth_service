import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  BeforeSave,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Address } from '../../address/entities/address.entity';
import { Order } from '../../order/entities/order.entity';

@Table
export class OrderAddress extends SqlModel {
  @ForeignKey(() => Order)
  @Column
  @Index
  @ApiProperty({
    description: 'Order Id',
    example: 1,
  })
  @IsNumber()
  order_id: number;

  @ForeignKey(() => Address)
  @Column
  @Index
  @ApiProperty({
    description: 'Billing Address Id',
    example: 1,
  })
  @IsNumber()
  billing_address_id: number;

  @Column
  @ApiProperty({
    description: 'First Name',
    example: 'Ross',
  })
  @IsString()
  @MaxLength(50)
  billing_first_name: string;

  @Column
  @ApiProperty({
    description: 'Last Name',
    example: 'Geller',
  })
  @IsString()
  @MaxLength(50)
  billing_last_name: string;

  @Column
  @ApiProperty({
    description: 'Full Name',
    example: 'Ross Geller',
    readOnly: true,
  })
  billing_name?: string;

  @Column
  @ApiProperty({
    description: 'Email',
    example: 'ross.geller@gmail.com',
  })
  @IsString()
  @IsEmail()
  billing_email: string;

  @Column({ type: DataType.STRING(7), defaultValue: '+1' })
  @ApiProperty({
    description: 'Phone Code',
    example: '+91',
  })
  @IsString()
  billing_phone_code: string;

  @Column(DataType.STRING(20))
  @ApiProperty({
    description: 'Phone',
    example: '9999999999',
  })
  @IsNumberString()
  @MaxLength(10)
  billing_phone: string;

  @Column
  @ApiProperty({
    description: 'address',
    example: 'address',
  })
  @IsString()
  @MaxLength(100)
  billing_address: string;

  @Column
  @ApiProperty({
    description: 'city',
    example: 'city',
  })
  @IsString()
  @MaxLength(30)
  billing_city?: string;

  @Column
  @ApiProperty({
    description: 'state',
    example: 'state',
  })
  @IsString()
  @MaxLength(30)
  billing_state?: string;

  @Column
  @ApiProperty({
    description: 'zip_code',
    example: 'zip_code',
  })
  @IsString()
  @MaxLength(6)
  billing_zip_code?: string;

  @Column
  @ApiProperty({
    description: 'First Name',
    example: 'Ross',
  })
  @IsString()
  @MaxLength(50)
  shipping_first_name: string;

  @Column
  @ApiProperty({
    description: 'Last Name',
    example: 'Geller',
  })
  @IsString()
  @MaxLength(50)
  shipping_last_name: string;

  @Column
  @ApiProperty({
    description: 'Full Name',
    example: 'Ross Geller',
    readOnly: true,
  })
  shipping_name?: string;

  @Column
  @ApiProperty({
    description: 'Email',
    example: 'ross.geller@gmail.com',
  })
  @IsString()
  @IsEmail()
  shipping_email: string;

  @Column({ type: DataType.STRING(7), defaultValue: '+1' })
  @ApiProperty({
    description: 'Phone Code',
    example: '+91',
  })
  @IsString()
  shipping_phone_code: string;

  @Column(DataType.STRING(20))
  @ApiProperty({
    description: 'Phone',
    example: '9999999999',
  })
  @IsNumberString()
  @MaxLength(10)
  shipping_phone: string;

  @Column
  @ApiProperty({
    description: 'address',
    example: 'address',
  })
  @IsString()
  @MaxLength(100)
  shipping_address: string;

  @Column
  @ApiProperty({
    description: 'city',
    example: 'city',
  })
  @IsString()
  @MaxLength(30)
  shipping_city?: string;

  @Column
  @ApiProperty({
    description: 'state',
    example: 'state',
  })
  @IsString()
  @MaxLength(30)
  shipping_state?: string;

  @Column
  @ApiProperty({
    description: 'zip_code',
    example: 'zip_code',
  })
  @IsString()
  @MaxLength(6)
  shipping_zip_code?: string;

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue: 'N' })
  @ApiProperty({
    enum: { Y: 'Y', N: 'N' },
    description: 'Y | N',
    example: 'Y',
  })
  @IsOptional()
  @IsEnum({ Y: 'Y', N: 'N' })
  is_primary?: string;

  @BeforeSave
  static setName(instance: OrderAddress) {
    if (instance.billing_first_name && instance.billing_last_name) {
      instance.billing_name = `${instance.billing_first_name} ${instance.billing_last_name}`;
    }

    if (instance.shipping_first_name && instance.shipping_last_name) {
      instance.shipping_name = `${instance.shipping_first_name} ${instance.shipping_last_name}`;
    }
  }
}
