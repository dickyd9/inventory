import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const paymentStatus = [
  'SELECTING_PAYMENT',
  'WAITING_PAYMENT',
  'PAID',
  'EXPIRED',
  'CANCELED',
];

const paymentMethod = [
  'CASH',
  'DEBIT',
];

@Schema({ timestamps: true })
export class PaymentRelation extends Document {
  @Prop({ type: String, unique: true, index: true, default: null })
  paymentCode: string;

  @Prop({ type: String, enum: paymentMethod, default: null })
  paymentMethod: string;

  @Prop({ type: Number, default: 0 })
  totalPrice: number;

  @Prop({ type: Number, default: 0 })
  paymentAmount: number;

  @Prop({ type: Number, default: 0 })
  changeAmount: number;

  @Prop({ type: String, enum: paymentStatus, default: 'SELECTING_PAYMENT' })
  paymentStatus: string;

  @Prop({ type: Date })
  expiredDate: Date;
}

export const PaymentRelationSchema =
  SchemaFactory.createForClass(PaymentRelation);

PaymentRelationSchema.pre('save', function (next) {
  const currentDate = new Date();

  (this.expiredDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)),
    next();
});
