import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { BigqueryModule } from '../bigquery/bigquery.module';
import { ConnectionsModule } from '../connections/connections.module';
import { QueryHistoryModule } from '../query-history/query-history.module';

@Module({
  imports: [BigqueryModule, ConnectionsModule, QueryHistoryModule],
  controllers: [QueryController],
  providers: [QueryService],
})
export class QueryModule {}
