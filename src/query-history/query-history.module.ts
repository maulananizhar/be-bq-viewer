import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueryHistory, QueryHistorySchema } from './query-history.entity';
import { QueryHistoryService } from './query-history.service';
import { QueryHistoryController } from './query-history.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QueryHistory.name, schema: QueryHistorySchema },
    ]),
  ],
  controllers: [QueryHistoryController],
  providers: [QueryHistoryService],
  exports: [QueryHistoryService],
})
export class QueryHistoryModule {}
