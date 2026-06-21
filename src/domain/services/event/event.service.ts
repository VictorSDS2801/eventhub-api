import { Inject, Injectable } from '@nestjs/common';
import { Event } from '../../entities/event/event';
import { Capacity } from '../../entities/event/capacity.vo';
import { I_EVENT_REPOSITORY } from '../../repositories/event.repository.interface';
import type {
  IEventRepository,
  IEventFilters,
} from '../../repositories/event.repository.interface';
import { EventNotFoundException } from '../../exceptions/event/event-not-found.exception';

export interface ICreateEventParams {
  title: string;
  description: string;
  organizerId: string;
  startDate: Date;
  endDate: Date;
  capacityTotal: number;
}

@Injectable()
export class EventService {
  constructor(
    @Inject(I_EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async createEvent(params: ICreateEventParams): Promise<Event> {
    const event = Event.create({
      title: params.title,
      description: params.description,
      organizerId: params.organizerId,
      startDate: params.startDate,
      endDate: params.endDate,
      capacity: Capacity.create(params.capacityTotal),
    });

    return this.eventRepository.save(event);
  }

  async publishEvent(id: string): Promise<Event> {
    const event = await this.findEventOrThrow(id);
    event.publish();
    return this.eventRepository.save(event);
  }

  async cancelEvent(id: string): Promise<Event> {
    const event = await this.findEventOrThrow(id);
    event.cancel();
    return this.eventRepository.save(event);
  }

  async findById(id: string): Promise<Event> {
    return this.findEventOrThrow(id);
  }

  async findAll(filters: IEventFilters): Promise<Event[]> {
    return this.eventRepository.findAll(filters);
  }

  private async findEventOrThrow(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new EventNotFoundException(id);
    }
    return event;
  }
}
