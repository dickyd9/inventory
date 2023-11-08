import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String, unique: true, index: true, default: null })
  paymentCode: string;

  @Prop({ type: String, index: true })
  customerCode: string;

  @Prop({ type: Object, default: null })
  item: {
    itemCode: string;
    amount: number;
    point: number;
    employeeCode: string;
  }[];

  @Prop({ type: Number, default: null })
  totalPoint: number;

  @Prop({ type: Number, default: null })
  totalAmount: number;

  @Prop({ type: Number, default: null })
  totalPrice: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.pre('save', function (next) {
  const currentDate = new Date();
  const randomPart = Math.random().toString().slice(2, 6);
  const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, '');

  // const buf = Buffer.from(randomPart, 'utf8');

  const basic = `INV-${randomPart}-${dateString}`;

  // this.paymentCode = buf.toString('base64');
  this.paymentCode = basic;
  next();
});
