import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../constants";
import type { AuthUser } from "../types/auth-user";

type JwtPayload = {
  sub: string;
  email: string;
  role: AuthUser["role"];
};

function extractToken(request: Request): string | null {
  const cookieToken = (request.cookies as Record<string, string> | undefined)?.access_token;
  if (cookieToken) {
    return cookieToken;
  }
  const header = request.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = extractToken(request);
    if (!token) {
      throw new UnauthorizedException({
        code: "UNAUTHENTICATED",
        message: "Sign in to continue",
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.get<string>("JWT_ACCESS_SECRET"),
      });
      request.user = { id: payload.sub, email: payload.email, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException({
        code: "INVALID_TOKEN",
        message: "Your session has expired. Sign in again.",
      });
    }
  }
}
