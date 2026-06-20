import { Event } from '../entities/event';

export const I_EVENT_REPOSITORY = 'I_EVENT_REPOSITORY';

export interface IEventFilters {
  organizerId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IEventRepository {
  save(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  findAll(filters: IEventFilters): Promise<Event[]>;
  delete(id: string): Promise<void>;
}
