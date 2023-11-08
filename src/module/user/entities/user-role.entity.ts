import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserRole extends Document {
  @Prop({ type: String, unique: true })
  roleCode: string;

  @Prop({ type: String, index: true })
  roleName: string;

  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  roleStatus: string;
}

export const userRoleSchema = SchemaFactory.createForClass(UserRole);

userRoleSchema.pre('save', function (next) {
  const currentDate = new Date();
  const randomPart = Math.random().toString().slice(2, 6);
  const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, '');

  const code = randomPart + dateString;
  const buf = Buffer.from(code, 'utf8');

  this.roleCode = buf.toString('base64');
  next();
});
