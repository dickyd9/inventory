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
