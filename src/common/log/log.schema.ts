import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Log extends Document {
  @Prop()
  timestamp: Date;

  @Prop()
  level: string;

  @Prop()
  message: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
