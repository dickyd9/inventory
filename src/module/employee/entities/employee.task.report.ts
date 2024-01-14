import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmployeeTaskReport extends Document {
  @Prop({ type: String, index: true, default: null })
  employeeCode: string;

  @Prop({ type: String, index: true, default: null })
  transactionRef: string;

  @Prop({ type: Number })
  incomeEarn: number;

  @Prop({ type: String })
  itemCode: string;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const EmployeeTaskReportSchema =
  SchemaFactory.createForClass(EmployeeTaskReport);
