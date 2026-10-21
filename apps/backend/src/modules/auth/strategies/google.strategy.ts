import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private static readonly disabled = "google-oauth-disabled";
  private readonly logger = new Logger(GoogleStrategy.name);
  readonly enabled: boolean;

  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = config.get<string>("GOOGLE_CLIENT_ID") ?? "";
    const clientSecret = config.get<string>("GOOGLE_CLIENT_SECRET") ?? "";
    const callbackURL = config.get<string>("GOOGLE_CALLBACK_URL") ?? "";
    const enabled = clientID.length > 0 && clientSecret.length > 0;

    super({
      clientID: enabled ? clientID : GoogleStrategy.disabled,
      clientSecret: enabled ? clientSecret : GoogleStrategy.disabled,
      callbackURL: callbackURL || "http://localhost:4000/api/v1/auth/google/callback",
      scope: ["email", "profile"],
    });

    this.enabled = enabled;
    if (!enabled) {
      this.logger.warn("Google OAuth disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const result = await this.authService.validateGoogleProfile(profile);
      done(null, result);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}
