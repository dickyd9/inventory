import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String, default: null })
  refreshToken: string;

  @Prop({ type: String, default: null })
  tokenPassword: string;

  @Prop({ type: Date, default: null })
  tokenPasswordExpires: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) {
    const hashedPassword = bcrypt.hashSync(
      this.password,
      bcrypt.genSaltSync(10),
    );
    this.password = hashedPassword;
  }
  next();
});
