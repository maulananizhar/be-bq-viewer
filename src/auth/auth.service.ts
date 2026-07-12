import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { Auth } from "./auth.entity";

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<Auth>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * On module init, seed the default admin user if it doesn't exist
   * and if AUTH_USERNAME / AUTH_PASSWORD env vars are provided.
   */
  async onModuleInit() {
    const envUsername = this.configService.get<string>("AUTH_USERNAME");
    const envPassword = this.configService.get<string>("AUTH_PASSWORD");

    if (!envUsername || !envPassword) {
      this.logger.warn(
        "AUTH_USERNAME and/or AUTH_PASSWORD environment variables are not set. " +
          "No default user will be seeded. Set both to enable authentication.",
      );
      return;
    }

    const existing = await this.authModel
      .findOne({ username: envUsername })
      .exec();
    if (existing) {
      // Update password hash if the plain-text env var changed
      const isSame = await bcrypt.compare(envPassword, existing.passwordHash);
      if (!isSame) {
        existing.passwordHash = await bcrypt.hash(envPassword, 10);
        await existing.save();
        this.logger.log(`Updated password for user '${envUsername}'`);
      }
    } else {
      const passwordHash = await bcrypt.hash(envPassword, 10);
      await this.authModel.create({
        username: envUsername,
        passwordHash,
        tokens: [],
      });
      this.logger.log(`Seeded default user '${envUsername}'`);
    }
  }

  /**
   * Verify the given username and password against the database.
   * Returns a bearer token on success, or throws on failure.
   */
  async login(username: string, password: string): Promise<{ token: string }> {
    const user = await this.authModel.findOne({ username }).exec();
    if (!user) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid username or password");
    }

    // Generate a unique token
    const token = crypto.randomUUID();
    user.tokens.push({ token, createdAt: new Date() });
    await user.save();

    this.logger.log(`Successful login for user '${username}'`);
    return { token };
  }

  /**
   * Validate a bearer token against any user in the database.
   * Returns true if the token is valid.
   */
  async validateToken(token: string): Promise<boolean> {
    const count = await this.authModel
      .countDocuments({ "tokens.token": token })
      .exec();
    return count > 0;
  }

  /**
   * Invalidate a token (logout).
   */
  async logout(token: string): Promise<void> {
    await this.authModel.updateMany(
      { "tokens.token": token },
      { $pull: { tokens: { token } } },
    );
  }
}
