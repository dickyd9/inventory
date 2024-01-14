import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class CustomerReport extends Document {
  @Prop({ type: String, required: true })
  customerId: string;

  @Prop({ type: String, required: true })
  transactionId: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const CustomerReportSchema =
  SchemaFactory.createForClass(CustomerReport);
