import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmployeeTask extends Document {
  @Prop({ type: String, index: true, default: null })
  itemCode: string;

  @Prop({ type: Array, default: null })
  employee: object[];
}

export const EmployeeTaskSchema = SchemaFactory.createForClass(EmployeeTask);
