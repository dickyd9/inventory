import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ type: String, unique: true, index: true, default: null })
  employeeCode: string;

  @Prop({ type: String })
  employeeName: string;

  @Prop({ type: String })
  employeeAddress: string;

  @Prop({ type: Number })
  employeeContact: number;

  @Prop({ type: Date, default: null })
  employeeJoinDate: Date;

  @Prop({ type: String, enum: ['male', 'female'], default: null })
  employeeGender: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

EmployeeSchema.pre('save', function (next) {
  const randomPart = Math.random().toString().slice(2, 6);

  const basic = 'SL-' + randomPart;

  this.employeeCode = basic;
  next();
});
