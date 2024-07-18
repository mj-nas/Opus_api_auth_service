import { OmitType } from '@nestjs/swagger';
import { UserDispenser } from '../entities/user-dispenser.entity';

export class CreateUserDispenserDto extends OmitType(UserDispenser, ['active'] as const) {}
