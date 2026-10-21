import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UsersService, toPublicUser, type PublicUser } from "../users/users.service";
import { AuthService, type AuthResult } from "./auth.service";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./auth.constants";
import { LoginDto, RefreshDto, RegisterDto } from "./dto/auth.dto";
import { GoogleStrategy } from "./strategies/google.strategy";
import type { AuthUser } from "../../common/types/auth-user";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly googleStrategy: GoogleStrategy,
  ) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(res, result);
    return { user: toPublicUser(result.user) };
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result);
    return { user: toPublicUser(result.user) };
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = dto.refreshToken || cookies?.[REFRESH_TOKEN_COOKIE] || "";
    const result = await this.authService.refresh(token);
    this.setAuthCookies(res, result);
    return { user: toPublicUser(result.user) };
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    return { message: "Signed out" };
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser): Promise<PublicUser> {
    return this.usersService.findOrFail(user.id).then(toPublicUser);
  }

  @Public()
  @Get("google")
  google(@Res() res: Response): void {
    if (!this.googleStrategy.enabled) {
      throw new BadRequestException({
        code: "GOOGLE_NOT_CONFIGURED",
        message: "Google sign-in is not configured",
      });
    }
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID") ?? "";
    const callbackUrl = this.config.get<string>("GOOGLE_CALLBACK_URL") ?? "";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "email profile",
      prompt: "select_account",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  @Public()
  @UseGuards(AuthGuard("google"))
  @Get("google/callback")
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    const result = req.user as AuthResult;
    this.setAuthCookies(res, result);
    const webOrigin = this.config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000";
    const staff = result.user.role === "staff" || result.user.role === "admin";
    res.redirect(`${webOrigin}${staff ? "/dashboard" : "/"}`);
  }

  private setAuthCookies(res: Response, result: AuthResult): void {
    const secure = this.config.get<string>("NODE_ENV") === "production";
    const accessTtl = this.config.get<number>("JWT_ACCESS_TTL", 900);
    const refreshTtl = this.config.get<number>("JWT_REFRESH_TTL", 604800);
    res.cookie(ACCESS_TOKEN_COOKIE, result.tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: accessTtl * 1000,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, result.tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTtl * 1000,
    });
  }
}
