import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ServicesCategory extends Document {
  @Prop({ type: String, index: true })
  categoryCode: string;

  @Prop({ type: String, unique: true })
  categoryName: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ServicesCategorySchema =
  SchemaFactory.createForClass(ServicesCategory);

ServicesCategorySchema.pre('save', function (next) {
  const randomPart = Math.random().toString().slice(2, 6);

  this.categoryCode = randomPart;

  next();
});
