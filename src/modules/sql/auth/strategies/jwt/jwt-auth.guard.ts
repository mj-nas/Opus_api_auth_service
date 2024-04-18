import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_OPTIONAL_PUBLIC_KEY } from 'src/core/decorators/optional-public.decorator';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';
import { OWNER_INCLUDE_ATTRIBUTES_KEY } from 'src/core/decorators/sql/owner-attributes.decorator';
import { OWNER_INCLUDE_POPULATES_KEY } from 'src/core/decorators/sql/owner-populates.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    const isOptionalPublic = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isOptionalPublic && !token) {
      return true;
    }

    request[OWNER_INCLUDE_ATTRIBUTES_KEY] = this.reflector.getAllAndOverride<
      string[]
    >(OWNER_INCLUDE_ATTRIBUTES_KEY, [context.getHandler(), context.getClass()]);
    request[OWNER_INCLUDE_POPULATES_KEY] = this.reflector.getAllAndOverride<
      string[]
    >(OWNER_INCLUDE_POPULATES_KEY, [context.getHandler(), context.getClass()]);
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user || !user.userId) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
