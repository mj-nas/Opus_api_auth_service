import { OmitType } from '@nestjs/swagger';
import { CmsHome } from '../entities/cms-home.entity';

export class CreateCmsHomeDto extends OmitType(CmsHome, ['active'] as const) {}
