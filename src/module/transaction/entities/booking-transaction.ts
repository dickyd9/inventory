import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BookingTransaction extends Document {
  @Prop({ type: String, index: true })
  bookingCode: string;

  @Prop({ type: String, index: true })
  customerCode: string;

  @Prop({ type: Object, default: null })
  item: {
    itemCode: string;
    amount: number;
    point: number;
    employeeCode: string;
  }[];

  @Prop({ type: String, default: 'PENDING' })
  status: string;

  @Prop({ type: Date, default: null })
  bookingDate: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const BookingTransactionSchema =
  SchemaFactory.createForClass(BookingTransaction);
