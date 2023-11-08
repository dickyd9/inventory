import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Outlet extends Document {
  @Prop({ required: true })
  outletName: string;

  @Prop({ required: true })
  outletAddress: string;
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);
