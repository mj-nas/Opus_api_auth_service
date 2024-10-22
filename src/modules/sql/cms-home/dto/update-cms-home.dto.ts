import { OmitType, PartialType } from '@nestjs/swagger';
import { CmsHome } from '../entities/cms-home.entity';

export class UpdateCmsHomeDto extends PartialType(
  OmitType(CmsHome, [] as const),
) {}
