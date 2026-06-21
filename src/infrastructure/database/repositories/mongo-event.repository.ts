import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../../domain/entities/event/event';
import {
  IEventRepository,
  IEventFilters,
} from '../../../domain/repositories/event.repository.interface';
import { EventDocument, EventSchemaClass } from '../schemas/event.schema';
import { EventMapper } from '../mappers/event.mapper';

@Injectable()
export class MongoEventRepository implements IEventRepository {
  constructor(
    @InjectModel(EventSchemaClass.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async save(event: Event): Promise<Event> {
    const data = EventMapper.toPersistence(event);

    const updated = await this.eventModel.findOneAndUpdate(
      { domainId: event.id },
      { $set: data },
      { upsert: true, new: true },
    );

    return EventMapper.toDomain(updated);
  }

  async findById(id: string): Promise<Event | null> {
    const document = await this.eventModel.findOne({ domainId: id });
    return document ? EventMapper.toDomain(document) : null;
  }

  async findAll(filters: IEventFilters): Promise<Event[]> {
    const query: Record<string, unknown> = {};
    if (filters.organizerId) query.organizerId = filters.organizerId;
    if (filters.status) query.status = filters.status;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const documents = await this.eventModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return documents.map((document) => EventMapper.toDomain(document));
  }

  async delete(id: string): Promise<void> {
    await this.eventModel.deleteOne({ domainId: id });
  }
}
