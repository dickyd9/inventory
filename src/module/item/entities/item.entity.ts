import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Item extends Document {
  @Prop({ type: String, index: true })
  itemCode: string;

  @Prop({ type: String, index: true })
  itemName: string;

  @Prop({ type: Number })
  itemPrice: number;

  @Prop({ type: String, default: null })
  itemCategory: string;

  @Prop({ type: String, enum: ['product', 'service'] })
  itemType: string;

  @Prop({ type: Number, default: null })
  itemPoint: number;

  @Prop({ type: Number, default: null })
  itemAmount: number;

  @Prop({ type: String, default: 'open' })
  itemStatus: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

ItemSchema.pre('save', function (next) {
  const currentDate = new Date();
  const randomPart = Math.random().toString().slice(2, 6);
  const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
  const name = this.itemName.slice(0, 2).toUpperCase();
  const type = this.itemType.slice(0, 2);

  this.itemCode = randomPart + dateString + name + type;

  next();
});
