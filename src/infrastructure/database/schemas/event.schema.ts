import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = EventSchemaClass & Document;

@Schema({ collection: 'events', timestamps: true })
export class EventSchemaClass {
  @Prop({ required: true, unique: true })
  domainId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  organizerId!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true })
  capacityTotal!: number;

  @Prop({ required: true, default: 0 })
  capacityOccupied!: number;

  @Prop({
    required: true,
    enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED'],
    default: 'DRAFT',
  })
  status!: string;

  @Prop({ required: true })
  createdAt!: Date;
}

export const EventSchema = SchemaFactory.createForClass(EventSchemaClass);
