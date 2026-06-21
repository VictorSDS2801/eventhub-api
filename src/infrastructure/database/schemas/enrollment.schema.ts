import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnrollmentDocument = EnrollmentSchemaClass & Document;

@Schema({ collection: 'enrollments', timestamps: true })
export class EnrollmentSchemaClass {
  @Prop({ required: true, unique: true })
  domainId!: string;

  @Prop({ required: true, index: true })
  eventId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({
    required: true,
    enum: ['CONFIRMED', 'WAITLISTED', 'CANCELLED'],
    default: 'CONFIRMED',
  })
  status!: string;

  @Prop({ type: Number, required: false, default: null })
  waitlistPosition!: number | null;

  @Prop({ required: true })
  createdAt!: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(
  EnrollmentSchemaClass,
);

EnrollmentSchema.index({ eventId: 1, userId: 1 });
