import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ type: String, index: true, default: null })
  customerCode: string;

  @Prop({ type: String })
  customerName: string;

  @Prop({ type: String })
  customerAddress: string;

  @Prop({ type: String })
  customerEmail: string;

  @Prop({ type: Date })
  customerDOB: Date;

  @Prop({ type: String })
  customerContact: string;

  @Prop({ type: String, enum: ['male', 'female'], default: 'male' })
  customerGender: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.pre('save', async function (next) {
  const jumlahData = await this.$model('Customer').countDocuments({
    deletedAt: null,
  });

  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateString = `${day}${month}${year}`;

  const paddedNumber = (jumlahData + 1).toString().padStart(3, '0');
  const basic = 'CUS-' + paddedNumber + dateString;

  this.customerCode = basic;
  next();
});
