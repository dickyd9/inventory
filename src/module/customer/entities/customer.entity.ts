import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ type: String, unique: true, index: true, default: null })
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

  @Prop({ type: String, enum: ['male', 'female'], default: null })
  customerGender: string;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.pre('save', function (next) {
  const randomPart = Math.random().toString().slice(2, 6);
  const currentDate = new Date();
  const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, '');

  const basic = dateString + randomPart;

  this.customerCode = basic;
  next();
});
