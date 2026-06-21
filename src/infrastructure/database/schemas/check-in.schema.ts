import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CheckInDocument = CheckInSchemaClass & Document;

@Schema({ collection: 'check_ins', timestamps: false })
export class CheckInSchemaClass {
  @Prop({ required: true, unique: true })
  domainId!: string;

  @Prop({ required: true, unique: true, index: true })
  enrollmentId!: string;

  @Prop({ required: true, index: true })
  eventId!: string;

  @Prop({ required: true })
  checkedInAt!: Date;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckInSchemaClass);
