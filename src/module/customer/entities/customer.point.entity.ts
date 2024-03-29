import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CustomerPoint extends Document {
  @Prop({ type: String, index: true })
  customerCode: string;

  @Prop({ type: String, index: true })
  transactionRef: string;

  @Prop({ type: Number, default: null })
  spendTransaction: number;

  @Prop({ type: Number })
  pointAmount: number;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const CustomerPointSchema = SchemaFactory.createForClass(CustomerPoint);
