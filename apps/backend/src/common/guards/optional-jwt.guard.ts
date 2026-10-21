import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { AuthUser } from "../types/auth-user";

@Injectable()
export class OptionalJwtGuard extends AuthGuard("jwt") {
  override handleRequest<TUser = AuthUser>(_err: Error | null, user: TUser | false): TUser | undefined {
    return user || undefined;
  }
}
