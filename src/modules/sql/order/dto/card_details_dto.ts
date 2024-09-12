import { ApiProperty } from '@nestjs/swagger';
import {
  IsCreditCard,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';

export class CardDetailsDto {
  @ApiProperty({
    description: 'Cardholder Name',
    example: 'Ross Geller',
  })
  @IsString()
  @MaxLength(100)
  cardholder_name: string;

  @ApiProperty({
    description: 'Card Number',
    example: '4111111111111111',
  })
  @IsCreditCard()
  card_number: string;

  @ApiProperty({
    description: 'Expiration Date in MM/YY format',
    example: '12/25',
  })
  @IsString()
  expiration_date: string;

  @ApiProperty({
    description: 'CVV (Card Verification Value)',
    example: '123',
  })
  @IsNumberString()
  @MaxLength(4)
  cvv: string;
}
