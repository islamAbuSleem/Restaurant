import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import type { Profile } from "passport-google-oauth20";
import { DB, type Database } from "../../database/database.module";
import { users, type UserRow } from "../../database/schema";
import { UsersService } from "../users/users.service";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: UserRow;
  tokens: TokenPair;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(DB) private readonly db: Database,
  ) {}

  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new ConflictException({
        code: "EMAIL_TAKEN",
        message: "Email is already registered",
      });
    }
    const passwordHash = await bcryptHash(input.password);
    const user = await this.usersService.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });
    return { user, tokens: await this.issueTokens(user) };
  }

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user?.passwordHash || !(await bcryptCompare(input.password, user.passwordHash))) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }
    return { user, tokens: await this.issueTokens(user) };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException({
        code: "INVALID_REFRESH_TOKEN",
        message: "Session expired, sign in again",
      });
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException({
        code: "INVALID_REFRESH_TOKEN",
        message: "Session expired, sign in again",
      });
    }
    return { user, tokens: await this.issueTokens(user) };
  }

  async validateGoogleProfile(profile: Profile): Promise<AuthResult> {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      throw new UnauthorizedException({
        code: "GOOGLE_NO_EMAIL",
        message: "Google account has no email",
      });
    }

    const [googleUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, profile.id))
      .limit(1);
    if (googleUser) {
      return { user: googleUser, tokens: await this.issueTokens(googleUser) };
    }

    const existingByEmail = await this.usersService.findByEmail(email);
    const user = existingByEmail
      ? await this.usersService.linkGoogle(existingByEmail.id, profile.id)
      : await this.usersService.create({
          email,
          name: profile.displayName || email.split("@")[0] || "Guest",
          passwordHash: null,
          googleId: profile.id,
        });
    return { user, tokens: await this.issueTokens(user) };
  }

  private async issueTokens(user: UserRow): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get<number>("JWT_ACCESS_TTL", 900),
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<number>("JWT_REFRESH_TTL", 604800),
      },
    );
    return { accessToken, refreshToken };
  }
}

async function bcryptHash(value: string): Promise<string> {
  const { hash } = await import("bcrypt");
  return hash(value, 12);
}

async function bcryptCompare(value: string, digest: string): Promise<boolean> {
  const { compare } = await import("bcrypt");
  return compare(value, digest);
}
