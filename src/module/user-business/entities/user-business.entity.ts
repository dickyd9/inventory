import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({})
export class UserBusiness extends Document {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String, unique: true, index: true })
  businessCode: string;
}

export const UserBusinessSchema = SchemaFactory.createForClass(UserBusiness);
