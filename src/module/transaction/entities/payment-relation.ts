import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const paymentStatus = [
  'SELECTING_PAYMENT',
  'WAITING_PAYMENT',
  'PAID',
  'EXPIRED',
  'CANCELED',
];

const paymentMethod = ['CASH', 'DEBIT', 'TRANSFER'];

@Schema({ timestamps: true })
export class PaymentRelation extends Document {
  @Prop({ type: String, unique: true, index: true, default: null })
  invoiceCode: string;

  @Prop({ index: true, default: null })
  paymentCode: string;

  @Prop({ type: String, enum: paymentMethod })
  paymentMethod: string;

  @Prop({ type: Number, default: 0 })
  totalPrice: number;

  @Prop({ type: Number, default: 0 })
  paymentAmount: number;

  @Prop({ type: Number, default: 0 })
  changeAmount: number;

  @Prop({ type: String, enum: paymentStatus, default: 'SELECTING_PAYMENT' })
  paymentStatus: string;

  @Prop({ type: String, default: null })
  receiptPath: string;

  @Prop({ type: Date })
  expiredDate: Date;
}

export const PaymentRelationSchema =
  SchemaFactory.createForClass(PaymentRelation);

PaymentRelationSchema.pre('save', async function (next) {
  const jumlahData = await this.$model('Services').countDocuments({
    deletedAt: null,
  });
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateString = `${day}${month}${year}`;

  const paddedNumber = (jumlahData + 1).toString().padStart(3, '0');
  const basic = 'INV-' + paddedNumber + dateString;

  this.invoiceCode = basic;
  (this.expiredDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)), next();
});
