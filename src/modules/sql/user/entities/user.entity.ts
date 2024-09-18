import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { IsUnique } from '@core/sql/sql.unique-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDecimal,
  IsEmail,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BeforeCreate,
  BeforeSave,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Index,
  Is,
  Table,
} from 'sequelize-typescript';
import config from 'src/config';
import { generateHash, slugify, uuid } from 'src/core/core.utils';
import { AuthProvider } from '../../auth/auth-provider.enum';
import { ConnectionVia } from '../connection-via.enum';
import { Role } from '../role.enum';
import { Status } from '../status.enum';

@DefaultScope(() => ({
  attributes: { exclude: ['password'] },
}))
@Table
export class User extends SqlModel {
  @Index
  @Column({ unique: 'slug' })
  @ApiProperty({
    description: 'Slug',
    example: 'user-slug',
    readOnly: true,
  })
  slug: string;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    defaultValue: Role.Customer,
  })
  @ApiProperty({
    enum: Role,
    description: 'Role',
    example: Role.Customer,
  })
  @IsEnum(Role)
  role?: Role;

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  uid: string;

  @Column({
    type: DataType.ENUM(...Object.values(AuthProvider)),
    defaultValue: 'Local',
  })
  @ApiProperty({
    enum: AuthProvider,
    description: 'Auth Provider',
    example: 'Local',
    readOnly: true,
  })
  provider: AuthProvider;

  @Column
  @ApiProperty({
    description: 'Google ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  google_id?: string;

  @Column
  @ApiProperty({
    description: 'Facebook ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  facebook_id?: string;

  @Column
  @ApiProperty({
    description: 'Firebase ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  firebase_id?: string;

  @Column
  @ApiProperty({
    description: 'Apple ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  apple_id?: string;

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
    description: 'Buisiness Name',
    example: 'Ross Geller',
    readOnly: true,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  buisiness_name?: string;

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
  @IsUnique('User', {
    message:
      'This email address is already associated with an existing account. Please use a different email address',
  })
  email: string;

  @Column({ type: DataType.STRING(7), defaultValue: '+1' })
  @ApiProperty({
    description: 'Phone Code',
    example: '+91',
  })
  @IsString()
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
    description: 'Password',
    example: '123456',
    writeOnly: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @Column
  @ApiProperty({
    description: 'Avatar',
    example: 'user/avatar.png',
  })
  @IsOptional()
  @IsString()
  get avatar(): string {
    return this.getDataValue('avatar')
      ? config().cdnURL + this.getDataValue('avatar')
      : null;
  }

  set avatar(v: string) {
    this.setDataValue(
      'avatar',
      typeof v === 'string' ? v.replace(config().cdnURL, '') : null,
    );
  }

  @Column(DataType.DECIMAL(10, 8))
  @ApiProperty({
    format: 'float',
    description: 'Latitude',
    example: 10.013947,
  })
  @ValidateIf((o) => o.role === Role.Dispenser)
  @IsDecimal()
  latitude: number;

  @Column(DataType.DECIMAL(10, 8))
  @ApiProperty({
    format: 'float',
    description: 'Longitude',
    example: 76.363272,
  })
  @ValidateIf((o) => o.role === Role.Dispenser)
  @IsDecimal()
  longitude: number;

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
    description: 'zip_code',
    example: 'zip_code',
  })
  @IsString()
  @MaxLength(6)
  zip_code?: string;

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
    description: 'city',
    example: 'city',
  })
  @IsString()
  @MaxLength(30)
  city?: string;

  @Column
  @ApiProperty({
    description: 'country',
    example: 'country',
  })
  country?: string;

  @Column({ defaultValue: false })
  @ApiProperty({
    description: 'Enable 2FA?',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enable_2fa?: boolean;

  @Column({ defaultValue: false })
  @ApiProperty({
    description: 'geotag',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  geotag?: boolean;

  @Column({ defaultValue: true })
  @ApiProperty({
    description: 'Send Email?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  send_email?: boolean;

  @Column({ defaultValue: true })
  @ApiProperty({
    description: 'Send SMS?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  send_sms?: boolean;

  @Column({ defaultValue: true })
  @ApiProperty({
    description: 'Send Push?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  send_push?: boolean;

  @Column
  @ApiProperty({
    format: 'date-time',
    description: 'Last Login At',
    example: '2021-01-01T00:00:00Z',
    readOnly: true,
  })
  last_login_at?: Date;

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue: 'N' })
  @ApiProperty({
    enum: { Y: 'Y', N: 'N' },
    description: 'Y | N',
    example: 'Y',
  })
  @IsOptional()
  @IsEnum({ Y: 'Y', N: 'N' })
  email_verified?: string;

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue: 'N' })
  @ApiProperty({
    enum: { Y: 'Y', N: 'N' },
    description: 'Y | N',
    example: 'Y',
  })
  @IsOptional()
  @IsEnum({ Y: 'Y', N: 'N' })
  learning_completed?: string;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    defaultValue: Status.Pending,
  })
  @ApiProperty({
    enum: Status,
    description: 'Status',
    example: Status.Approve,
  })
  @IsEnum(Status)
  status: Status;

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

  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'Dispenser Id',
    example: 1,
    readOnly: true,
  })
  @IsOptional()
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
  @IsOptional()
  @IsEnum(ConnectionVia)
  connection_via?: ConnectionVia;

  @Include({
    attributes: [
      'id',
      'slug',
      'role',
      'uid',
      'first_name',
      'last_name',
      'name',
      'email',
      'phone_code',
      'phone',
      'avatar',
    ],
  })
  @BelongsTo(() => User, { constraints: false })
  dispenser: User;

  @BeforeSave
  static setName(instance: User) {
    if (instance.first_name && instance.last_name) {
      instance.name = `${instance.first_name} ${instance.last_name}`;
    }
  }

  @BeforeCreate
  static async hashPassword(instance: User) {
    if (instance.password) {
      instance.password = await generateHash(instance.password);
    }
  }

  @BeforeCreate
  static setUuid(instance: User) {
    instance.uid = uuid();
  }

  @BeforeCreate
  static async setSlug(instance: User) {
    const slug = slugify(instance.name);

    // Check if the generated slug already exists in the database
    let uniqueSlug = slug;
    let num = 2;
    while (
      await User.findOne({ where: { slug: uniqueSlug }, paranoid: false })
    ) {
      uniqueSlug = `${slug}-${num}`;
      num++;
    }

    // Assign the unique slug to the instance
    instance.slug = uniqueSlug;
  }

  @BeforeUpdate
  static async formatThumb(instance: User) {
    if (instance.avatar) {
      instance.avatar = instance.avatar.replace(config().cdnURL, '');
    }
  }

  @BeforeUpdate
  static async formatQRCode(instance: User) {
    if (instance.qr_code) {
      instance.qr_code = instance.qr_code.replace(config().cdnURL, '');
    }
  }
}
