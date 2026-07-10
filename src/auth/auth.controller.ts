import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { password: string }) {
    if (!body.password || typeof body.password !== 'string') {
      return { error: 'Password is required' };
    }
    return this.authService.login(body.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authorization?: string) {
    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      this.authService.logout(token);
    }
    return { success: true };
  }
}
