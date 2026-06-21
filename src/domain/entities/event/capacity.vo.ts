import { DomainException } from '../../exceptions/domain.exception';

export class InvalidCapacityException extends DomainException {
  constructor(reason: string) {
    super(`Capacidade inválida: ${reason}`, 'INVALID_CAPACITY');
  }
}

export class Capacity {
  private constructor(
    private readonly total: number,
    private readonly occupied: number,
  ) {}

  static create(total: number): Capacity {
    if (total <= 0) {
      throw new InvalidCapacityException(
        'a capacidade total deve ser maior que zero.',
      );
    }
    return new Capacity(total, 0);
  }

  static restore(total: number, occupied: number): Capacity {
    if (occupied > total) {
      throw new InvalidCapacityException(
        'vagas ocupadas não podem exceder o total.',
      );
    }
    return new Capacity(total, occupied);
  }

  occupyOne(): Capacity {
    if (this.occupied >= this.total) {
      throw new InvalidCapacityException('não há vagas disponíveis.');
    }
    return new Capacity(this.total, this.occupied + 1);
  }

  releaseOne(): Capacity {
    if (this.occupied <= 0) {
      throw new InvalidCapacityException('não há vagas ocupadas para liberar.');
    }
    return new Capacity(this.total, this.occupied - 1);
  }

  hasAvailableSpots(): boolean {
    return this.occupied < this.total;
  }

  getAvailable(): number {
    return this.total - this.occupied;
  }

  getTotal(): number {
    return this.total;
  }

  getOccupied(): number {
    return this.occupied;
  }
}
