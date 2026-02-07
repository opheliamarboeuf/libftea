
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// Reflector is a NestJS utility that can read metadata added by decorators
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
// Wraps AuthGuard('jwt') in a class so it can be injected or used globally by NestJS
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

// context.getHandler(): returns the function that handles this route
// e.g., login() or getMe()
// context.getClass(): returns the class that contains the handler (e.g., AuthController).
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>( //checks if metadata exists for the given key first on the handler, then on the class.
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true; // skip JWT check
    }

    return super.canActivate(context);
  }
}
