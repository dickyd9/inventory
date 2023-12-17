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

EmployeeSchema.pre('save', async function (next) {
  const jumlahData = await this.$model('Employee').countDocuments({
    deletedAt: null,
  });
  const date = new Date();
  const month = date.getUTCMonth() + 1; //months from 1-12
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateString = `${day}${month}${year}`;

  const paddedNumber = (jumlahData + 1).toString().padStart(3, '0');
  const basic = 'EM-' + paddedNumber + dateString;

  this.employeeCode = basic;
  next();
});
