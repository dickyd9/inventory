import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Services extends Document {
  @Prop({ type: String, index: true })
  servicesCode: string;

  @Prop({ type: String, index: true })
  servicesName: string;

  @Prop({ type: Number })
  servicesPrice: number;

  @Prop({ type: String, default: null })
  servicesCategory: string;

  @Prop({ type: Number, default: null })
  servicesPoint: number;

  @Prop({ type: String, ennum: ['active', 'inactive'], default: 'active' })
  servicesStatus: string;

  @Prop({ type: Object, default: null })
  servicesItem: {
    itemCode: string;
    amountUsage: number;
    addDate: Date;
  }[];

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ServicesSchema = SchemaFactory.createForClass(Services);

ServicesSchema.pre('save', function (next) {
  const randomPart = Math.random().toString().slice(2, 6);

  this.servicesCode = randomPart;

  next();
});
