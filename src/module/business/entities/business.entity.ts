import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Item } from 'src/module/item/entities/item.entity';
// import { Outlet, OutletSchema } from './outlet.entity';

@Schema({ timestamps: true })
export class Business extends Document {
  @Prop({ type: String, index: true })
  businessName: string;

  @Prop({ type: String })
  businessAddress: string;

  @Prop({ type: String })
  businessCode: string;

  @Prop({ type: Array, default: null })
  item: string[];
}

export const BusinessSchema = SchemaFactory.createForClass(Business);

BusinessSchema.pre('save', function (next) {
  // Lakukan logika sebelum penyimpanan di sini
  // Contoh: Menghasilkan kode bisnis acak
  this.businessCode = generateRandomString(10);
  next(); // Penting untuk memanggil next() agar penyimpanan dapat dilanjutkan
});

function generateRandomString(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}
