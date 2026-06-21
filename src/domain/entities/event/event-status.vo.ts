export enum EventStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  FINISHED = 'FINISHED',
}

export class EventStatus {
  private constructor(private readonly value: EventStatusEnum) {}

  static draft(): EventStatus {
    return new EventStatus(EventStatusEnum.DRAFT);
  }

  static published(): EventStatus {
    return new EventStatus(EventStatusEnum.PUBLISHED);
  }

  static cancelled(): EventStatus {
    return new EventStatus(EventStatusEnum.CANCELLED);
  }

  static finished(): EventStatus {
    return new EventStatus(EventStatusEnum.FINISHED);
  }

  static fromValue(value: EventStatusEnum): EventStatus {
    return new EventStatus(value);
  }

  isCancelled(): boolean {
    return this.value === EventStatusEnum.CANCELLED;
  }

  isFinished(): boolean {
    return this.value === EventStatusEnum.FINISHED;
  }

  isPublished(): boolean {
    return this.value === EventStatusEnum.PUBLISHED;
  }

  getValue(): EventStatusEnum {
    return this.value;
  }

  equals(other: EventStatus): boolean {
    return this.value === other.value;
  }
}
