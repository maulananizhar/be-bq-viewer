import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueryHistory, QueryHistoryDocument } from './query-history.entity';

@Injectable()
export class QueryHistoryService {
  constructor(
    @InjectModel(QueryHistory.name)
    private readonly model: Model<QueryHistoryDocument>,
  ) {}

  async findByConnection(
    connectionId: string,
    limit = 50,
  ): Promise<QueryHistory[]> {
    return this.model
      .find({ connection_id: new Types.ObjectId(connectionId) })
      .sort({ executedAt: -1 })
      .limit(limit)
      .exec();
  }

  async create(connectionId: string, query: string): Promise<QueryHistory> {
    return this.model.create({
      connection_id: new Types.ObjectId(connectionId),
      query,
    });
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async removeByConnection(connectionId: string): Promise<void> {
    await this.model
      .deleteMany({ connection_id: new Types.ObjectId(connectionId) })
      .exec();
  }
}
