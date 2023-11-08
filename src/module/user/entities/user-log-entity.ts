import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserLog extends Document {
  @Prop({ type: Date })
  date: Date;

  @Prop({ type: String, index: true })
  userId: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  detail: string;
}

export const userLogSchema = SchemaFactory.createForClass(UserLog);

userLogSchema.pre('save', function (next) {
  const currentDate = new Date();
  this.date = currentDate;
  next();
});
