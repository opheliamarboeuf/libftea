// @Public() is a custom decorator that marks a route as public 
// by attaching metadata (isPublic: true). 
// The JwtAuthGuard reads this metadata and allows requests to bypass JWT authentication.

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
