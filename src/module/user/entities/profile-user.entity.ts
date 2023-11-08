import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProfileUser extends Document {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String, default: null })
  firstName: string;

  @Prop({ type: String, default: null })
  lastName: string;

  @Prop({ type: String, default: null })
  email: string;

  @Prop({ type: String, enum: ['owner', 'employee'], default: 'owner' })
  role: string;

  @Prop({ type: String, enum: ['male', 'female'], default: 'male' })
  gender: string;
}

export const profileUserSchema = SchemaFactory.createForClass(ProfileUser);
