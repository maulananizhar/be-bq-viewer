import { Module } from '@nestjs/common';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { BigqueryModule } from '../bigquery/bigquery.module';
import { ConnectionsModule } from '../connections/connections.module';

@Module({
  imports: [BigqueryModule, ConnectionsModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
