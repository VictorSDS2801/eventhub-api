import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckIn } from '../../../domain/entities/check-in/check-in';
import type { ICheckInRepository } from '../../../domain/repositories/check-in.repository.interface';
import {
  CheckInDocument,
  CheckInSchemaClass,
} from '../schemas/check-in.schema';
import { CheckInMapper } from '../mappers/check-in.mapper';

@Injectable()
export class MongoCheckInRepository implements ICheckInRepository {
  constructor(
    @InjectModel(CheckInSchemaClass.name)
    private readonly checkInModel: Model<CheckInDocument>,
  ) {}

  async save(checkIn: CheckIn): Promise<CheckIn> {
    const data = CheckInMapper.toPersistence(checkIn);

    const created = await this.checkInModel.findOneAndUpdate(
      { domainId: checkIn.id },
      { $set: data },
      { upsert: true, new: true },
    );

    return CheckInMapper.toDomain(created);
  }

  async findByEnrollmentId(enrollmentId: string): Promise<CheckIn | null> {
    const document = await this.checkInModel.findOne({ enrollmentId });
    return document ? CheckInMapper.toDomain(document) : null;
  }

  async findByEvent(eventId: string): Promise<CheckIn[]> {
    const documents = await this.checkInModel.find({ eventId });
    return documents.map((document) => CheckInMapper.toDomain(document));
  }
}
