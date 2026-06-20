import { Event } from '../../domain/entities/event';

export class EventResponseDto {
  id!: string;
  title!: string;
  description!: string;
  organizerId!: string;
  startDate!: Date;
  endDate!: Date;
  status!: string;
  capacity!: {
    total: number;
    occupied: number;
    available: number;
  };
  createdAt!: Date;

  static fromDomain(event: Event): EventResponseDto {
    const dto = new EventResponseDto();
    dto.id = event.id;
    dto.title = event.getTitle();
    dto.description = event.getDescription();
    dto.organizerId = event.organizerId;
    dto.startDate = event.getStartDate();
    dto.endDate = event.getEndDate();
    dto.status = event.getStatus().getValue();
    dto.capacity = {
      total: event.getCapacity().getTotal(),
      occupied: event.getCapacity().getOccupied(),
      available: event.getCapacity().getAvailable(),
    };
    dto.createdAt = event.createdAt;
    return dto;
  }
}
