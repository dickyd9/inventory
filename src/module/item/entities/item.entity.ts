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

ItemSchema.pre('save', function (next) {
  const randomPart = Math.random().toString().slice(2, 6);

  this.itemCode = randomPart;

  next();
});
