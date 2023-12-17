import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Item extends Document {
  @Prop({ type: String, index: true })
  itemCode: string;

  @Prop({ type: String, index: true })
  itemName: string;

  @Prop({ type: String, default: 'pcs' })
  itemUnit: string;

  @Prop({ type: Number })
  itemPrice: number;

  @Prop({ type: Number, default: null })
  itemAmount: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

ItemSchema.pre('save', async function (next) {
  const jumlahData = await this.$model('Item').countDocuments({
    deletedAt: null,
  });
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateString = `${day}${month}${year}`;

  const paddedNumber = (jumlahData + 1).toString().padStart(3, '0');
  const basic = 'ITM-' + paddedNumber + dateString;

  this.itemCode = basic;

  next();
});
