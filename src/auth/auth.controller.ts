import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    if (!body.username || typeof body.username !== "string") {
      return { error: "Username is required" };
    }
    if (!body.password || typeof body.password !== "string") {
      return { error: "Password is required" };
    }
    return this.authService.login(body.username, body.password);
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Headers("authorization") authorization?: string) {
    if (authorization) {
      const token = authorization.replace("Bearer ", "");
      await this.authService.logout(token);
    }
    return { success: true };
  }
}
