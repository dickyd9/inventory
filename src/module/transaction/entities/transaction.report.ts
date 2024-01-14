import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TransactionReport extends Document {
  @Prop({ type: String, index: true })
  transactionId: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const TransactionReportSchema =
  SchemaFactory.createForClass(TransactionReport);
