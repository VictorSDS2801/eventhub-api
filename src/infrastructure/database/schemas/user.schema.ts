import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchemaClass & Document;

@Schema({ collection: 'users', timestamps: true })
export class UserSchemaClass {
  @Prop({ required: true, unique: true })
  domainId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    required: true,
    enum: ['PARTICIPANT', 'ORGANIZER', 'ADMIN'],
    default: 'PARTICIPANT',
  })
  role!: string;

  @Prop({ required: true })
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
