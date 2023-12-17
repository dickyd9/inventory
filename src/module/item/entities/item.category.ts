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

ItemCategorySchema.pre('save', async function (next) {
  const jumlahData = await this.$model('Services').countDocuments({
    deletedAt: null,
  });
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateString = `${day}${month}${year}`;

  const paddedNumber = (jumlahData + 1).toString().padStart(3, '0');
  const basic = 'ITM-' + paddedNumber + dateString;

  this.categoryCode = basic;

  next();
});
