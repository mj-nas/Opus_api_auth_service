import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_PUBLIC_KEY = 'isOptionalPublic';
export const OptionalPublic = () => SetMetadata(IS_OPTIONAL_PUBLIC_KEY, true);
