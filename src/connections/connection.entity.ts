import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConnectionDocument = Connection & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.private_key;
    },
  },
})
export class Connection {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  project_id: string;

  @Prop({ default: 'service_account' })
  type: string;

  @Prop()
  private_key_id: string;

  @Prop({ required: true })
  private_key: string;

  @Prop({ required: true })
  client_email: string;

  @Prop()
  client_id: string;

  @Prop({ default: 'https://oauth2.googleapis.com/token' })
  token_url: string;

  readonly createdAt?: Date;

  readonly updatedAt?: Date;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
