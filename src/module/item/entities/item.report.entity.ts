import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ItemReport extends Document {
  @Prop({ type: String, index: true })
  itemCode: string;

  @Prop({ type: Number, default: null })
  amount: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ItemReportSchema = SchemaFactory.createForClass(ItemReport);
