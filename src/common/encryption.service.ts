import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    const secret = configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required for encrypting sensitive credentials.',
      );
    }
    // Derive a 32-byte key using SHA-256 for AES-256
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypt a plaintext string.
   * Returns format: iv:authTag:ciphertext (all hex-encoded)
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt a string that was encrypted by {@link encrypt}.
   * If the value does not match the expected format (e.g. already plaintext),
   * it is returned as-is for backward compatibility with existing data.
   */
  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // Value doesn't look encrypted – return as-is (backward compat)
      return encryptedText;
    }
    try {
      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      this.logger.warn('Failed to decrypt value, returning as-is');
      return encryptedText;
    }
  }
}
