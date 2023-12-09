import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ItemCategory extends Document {
  @Prop({ type: String, default: null })
  categoryCode: string;

  @Prop({ type: String })
  categoryName: string;
}

export const ItemCategorySchema = SchemaFactory.createForClass(ItemCategory);

ItemCategorySchema.pre('save', function (next) {
  const randomPart = Math.random().toString().slice(2, 6);

  this.categoryCode = randomPart;

  next();
});
