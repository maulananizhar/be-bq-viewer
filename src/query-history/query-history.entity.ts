import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QueryHistoryDocument = QueryHistory & Document;

@Schema({
  timestamps: { createdAt: 'executedAt', updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class QueryHistory {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Connection' })
  connection_id: Types.ObjectId;

  @Prop({ required: true })
  query: string;

  readonly executedAt?: Date;
}

export const QueryHistorySchema = SchemaFactory.createForClass(QueryHistory);
