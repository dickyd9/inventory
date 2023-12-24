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
  service: {
    serviceCode: string;
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

  @Prop({ type: Boolean, default: false })
  isDone: boolean;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.pre('save', async function (next) {
  const jumlahData = await this.$model('Transaction').countDocuments({
    deletedAt: null,
  });
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateString = `${day}${month}${year}`;

  const paddedNumber = (jumlahData + 1).toString().padStart(3, '0');
  const basic = 'TRX-' + paddedNumber + dateString;

  this.paymentCode = basic;
  next();
});
