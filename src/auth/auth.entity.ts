import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AuthDocument = Auth & Document;

@Schema({
  collection: "authentications",
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret.passwordHash;
      delete ret.__v;
      delete ret.tokens;
    },
  },
})
export class Auth {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: [{ token: String, createdAt: Date }], default: [] })
  tokens: { token: string; createdAt: Date }[];
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
