import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment } from '../../../domain/entities/enrollment/enrollment';
import type { IEnrollmentRepository } from '../../../domain/repositories/enrollment.repository.interface';
import {
  EnrollmentDocument,
  EnrollmentSchemaClass,
} from '../schemas/enrollment.schema';
import { EnrollmentMapper } from '../mappers/enrollment.mapper';

@Injectable()
export class MongoEnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectModel(EnrollmentSchemaClass.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async save(enrollment: Enrollment): Promise<Enrollment> {
    const data = EnrollmentMapper.toPersistence(enrollment);

    const updated = await this.enrollmentModel.findOneAndUpdate(
      { domainId: enrollment.id },
      { $set: data },
      { upsert: true, new: true },
    );

    return EnrollmentMapper.toDomain(updated);
  }

  async findById(id: string): Promise<Enrollment | null> {
    const document = await this.enrollmentModel.findOne({ domainId: id });
    return document ? EnrollmentMapper.toDomain(document) : null;
  }

  async findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<Enrollment | null> {
    const document = await this.enrollmentModel.findOne({
      eventId,
      userId,
      status: { $ne: 'CANCELLED' },
    });
    return document ? EnrollmentMapper.toDomain(document) : null;
  }

  async findByEvent(eventId: string): Promise<Enrollment[]> {
    const documents = await this.enrollmentModel.find({ eventId });
    return documents.map((document) => EnrollmentMapper.toDomain(document));
  }

  async findNextWaitlisted(eventId: string): Promise<Enrollment | null> {
    const document = await this.enrollmentModel
      .findOne({ eventId, status: 'WAITLISTED' })
      .sort({ waitlistPosition: 1 }); // menor posição primeiro = próximo da fila

    return document ? EnrollmentMapper.toDomain(document) : null;
  }

  async countWaitlistedByEvent(eventId: string): Promise<number> {
    return this.enrollmentModel.countDocuments({
      eventId,
      status: 'WAITLISTED',
    });
  }
}
