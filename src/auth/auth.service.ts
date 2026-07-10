import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

interface TokenEntry {
  token: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly validTokens = new Map<string, TokenEntry>();
  private readonly passwordHash: string;

  constructor(configService: ConfigService) {
    const hash = configService.get<string>('AUTH_PASSWORD');
    if (!hash) {
      this.logger.warn(
        'AUTH_PASSWORD environment variable is not set. Authentication will reject all requests.',
      );
      this.passwordHash = '';
    } else {
      this.passwordHash = hash;
    }
  }

  /**
   * Verify the given password against the AUTH_PASSWORD hash.
   * Returns a bearer token on success, or throws on failure.
   */
  async login(password: string): Promise<{ token: string }> {
    if (!this.passwordHash) {
      throw new UnauthorizedException('Authentication is not configured');
    }

    const isValid = await bcrypt.compare(password, this.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate a unique token
    const token = crypto.randomUUID();
    this.validTokens.set(token, { token, createdAt: new Date() });

    this.logger.log('Successful login');
    return { token };
  }

  /**
   * Validate a bearer token.
   * Returns true if the token is valid.
   */
  validateToken(token: string): boolean {
    return this.validTokens.has(token);
  }

  /**
   * Invalidate a token (logout).
   */
  logout(token: string): void {
    this.validTokens.delete(token);
  }
}
