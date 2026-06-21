import { IEnrollmentCancellationResult } from '../../domain/services/enrollment.service';
import { EnrollmentResponseDto } from './enrollment-response.dto';

export class CancellationResponseDto {
  cancelled!: EnrollmentResponseDto;
  promoted!: EnrollmentResponseDto | null;

  static fromResult(
    result: IEnrollmentCancellationResult,
  ): CancellationResponseDto {
    const dto = new CancellationResponseDto();
    dto.cancelled = EnrollmentResponseDto.fromDomain(result.cancelled);
    dto.promoted = result.promoted
      ? EnrollmentResponseDto.fromDomain(result.promoted)
      : null;
    return dto;
  }
}
