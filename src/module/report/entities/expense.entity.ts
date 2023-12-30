import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Expenses extends Document {
  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  note: string;

  @Prop({ type: String, default: null })
  itemCode: string;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: String, default: null })
  paymentMethod: string;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ExpensesSchema = SchemaFactory.createForClass(Expenses);
