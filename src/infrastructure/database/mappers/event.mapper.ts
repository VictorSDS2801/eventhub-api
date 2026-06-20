import { Event } from '../../../domain/entities/event';
import { Capacity } from '../../../domain/entities/capacity.vo';
import {
  EventStatus,
  EventStatusEnum,
} from '../../../domain/entities/event-status.vo';
import { EventDocument } from '../schemas/event.schema';

export class EventMapper {
  static toDomain(document: EventDocument): Event {
    return Event.restore({
      id: document.domainId,
      title: document.title,
      description: document.description,
      organizerId: document.organizerId,
      startDate: document.startDate,
      endDate: document.endDate,
      capacity: Capacity.restore(
        document.capacityTotal,
        document.capacityOccupied,
      ),
      status: EventStatus.fromValue(document.status as EventStatusEnum),
      createdAt: document.createdAt,
    });
  }

  static toPersistence(event: Event): Partial<EventDocument> {
    return {
      domainId: event.id,
      title: event.getTitle(),
      description: event.getDescription(),
      organizerId: event.organizerId,
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      capacityTotal: event.getCapacity().getTotal(),
      capacityOccupied: event.getCapacity().getOccupied(),
      status: event.getStatus().getValue(),
      createdAt: event.createdAt,
    };
  }
}
