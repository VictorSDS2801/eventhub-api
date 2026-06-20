import { randomUUID } from 'crypto';
import { Capacity } from './capacity.vo';
import { EventStatus } from './event-status.vo';
import { CapacityExceededException } from '../exceptions/capacity-exceeded.exception';
import { EventAlreadyFinishedException } from '../exceptions/event-already-finished.exception';
import { DomainException } from '../exceptions/domain.exception';

export class InvalidEventDateException extends DomainException {
  constructor(reason: string) {
    super(`Data do evento inválida: ${reason}`, 'INVALID_EVENT_DATE');
  }
}

export interface IEventProps {
  id?: string;
  title: string;
  description: string;
  organizerId: string;
  startDate: Date;
  endDate: Date;
  capacity: Capacity;
  status?: EventStatus;
  createdAt?: Date;
}

export class Event {
  readonly id: string;
  private title: string;
  private description: string;
  readonly organizerId: string;
  private startDate: Date;
  private endDate: Date;
  private capacity: Capacity;
  private status: EventStatus;
  readonly createdAt: Date;

  private constructor(props: Required<IEventProps>) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.organizerId = props.organizerId;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.capacity = props.capacity;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(props: IEventProps): Event {
    if (props.startDate >= props.endDate) {
      throw new InvalidEventDateException(
        'a data de início deve ser anterior à data de término.',
      );
    }
    if (props.startDate < new Date()) {
      throw new InvalidEventDateException(
        'a data de início não pode estar no passado.',
      );
    }

    return new Event({
      id: props.id ?? randomUUID(),
      title: props.title,
      description: props.description,
      organizerId: props.organizerId,
      startDate: props.startDate,
      endDate: props.endDate,
      capacity: props.capacity,
      status: props.status ?? EventStatus.draft(),
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static restore(props: Required<IEventProps>): Event {
    return new Event(props);
  }

  publish(): void {
    if (this.status.isCancelled() || this.status.isFinished()) {
      throw new EventAlreadyFinishedException(this.id);
    }
    this.status = EventStatus.published();
  }

  cancel(): void {
    if (this.status.isFinished()) {
      throw new EventAlreadyFinishedException(this.id);
    }
    this.status = EventStatus.cancelled();
  }

  occupySpot(): void {
    if (this.status.isCancelled() || this.status.isFinished()) {
      throw new EventAlreadyFinishedException(this.id);
    }
    if (!this.capacity.hasAvailableSpots()) {
      throw new CapacityExceededException(this.id);
    }
    this.capacity = this.capacity.occupyOne();
  }

  releaseSpot(): void {
    this.capacity = this.capacity.releaseOne();
  }

  hasAvailableSpots(): boolean {
    return this.capacity.hasAvailableSpots();
  }

  // getters (somente leitura pro mundo externo)
  getTitle(): string {
    return this.title;
  }
  getDescription(): string {
    return this.description;
  }
  getStartDate(): Date {
    return this.startDate;
  }
  getEndDate(): Date {
    return this.endDate;
  }
  getCapacity(): Capacity {
    return this.capacity;
  }
  getStatus(): EventStatus {
    return this.status;
  }
}
