import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ItemCategory } from './item.category';

@Schema({ timestamps: true })
export class Item extends Document {
  @Prop({ type: String, index: true })
  itemCode: string;

  @Prop({ type: String, index: true })
  itemName: string;

  @Prop({ type: String, default: null })
  itemType: string;

  @Prop({ type: Number, default: 0 })
  itemPoint: number;

  @Prop({ type: String, default: null })
  itemUnit: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ItemCategory',
    default: null,
  })
  itemCategory: ItemCategory;

  @Prop({ type: Number })
  itemPrice: number;

  @Prop({ type: Number, default: null })
  itemAmount: number;

  @Prop({ type: String, default: 'active' })
  itemStatus: string;

  @Prop({ type: Object, default: null })
  itemUseService: {
    itemCode: string;
    amount: number;
    addDate: Date;
  }[];

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
  const basic =
    this.itemType == 'services'
      ? 'SE-' + paddedNumber + dateString
      : 'ITM-' + paddedNumber + dateString;

  this.itemCode = basic;

  next();
});
