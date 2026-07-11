import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CommonModule } from "./common/common.module";
import { BigqueryModule } from "./bigquery/bigquery.module";
import { QueryModule } from "./query/query.module";
import { ConnectionsModule } from "./connections/connections.module";
import { DiscoveryModule } from "./discovery/discovery.module";
import { QueryHistoryModule } from "./query-history/query-history.module";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri =
          configService.get<string>("MONGODB_URI") ||
          "mongodb://root:password@localhost:27017/bq_viewer_db?directConnection=true";

        // Log sanitized URI (hide password) for debugging
        const sanitized = uri.replace(/:[^:@]+@/, ":****@");
        console.log(`[MongoDB] Connecting to: ${sanitized}`);

        // authSource: 'admin' because root users are typically created in admin database
        return { uri, authSource: "admin" };
      },
      inject: [ConfigService],
    }),
    CommonModule,
    BigqueryModule,
    QueryModule,
    ConnectionsModule,
    DiscoveryModule,
    QueryHistoryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
