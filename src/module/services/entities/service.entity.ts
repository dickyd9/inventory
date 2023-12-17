import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Services extends Document {
  @Prop({ type: String, index: true })
  servicesCode: string;

  @Prop({ type: String, index: true })
  servicesName: string;

  @Prop({ type: Number })
  servicesPrice: number;

  @Prop({ type: String, default: null, index: true })
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

ServicesSchema.pre('save', async function (next) {
  const jumlahData = await this.$model('Services').countDocuments({
    deletedAt: null,
  });
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateString = `${day}${month}${year}`;

  const paddedNumber = (jumlahData + 1).toString().padStart(3, '0');
  const basic = 'SE-' + paddedNumber + dateString;
  this.servicesCode = basic;

  next();
});
