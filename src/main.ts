import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: allow multiple origins via comma-separated env var, or fallback
  const corsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:5000"];

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  // Global prefix dipindah ke Express server (server.js) untuk proxy handling
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
