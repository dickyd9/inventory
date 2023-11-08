import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmployeeTaskReport extends Document {
  @Prop({ type: String, index: true, default: null })
  employeeCode: string;

  @Prop({ type: String, index: true })
  transactionRef: string;

  @Prop({ type: String })
  serviceCode: string;
}

export const EmployeeTaskReportSchema = SchemaFactory.createForClass(EmployeeTaskReport);
