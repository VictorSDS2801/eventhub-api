import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnrollmentService } from '../../domain/services/enrollment.service';
import { EnrollDto } from '../dtos/enroll.dto';
import { EnrollmentResponseDto } from '../dtos/enrollment-response.dto';
import { CancellationResponseDto } from '../dtos/cancellation-response.dto';
import { JwtAuthGuard } from '../../infrastructure/shared/guard/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/shared/decorators/current-user.decorator';
import type { ITokenPayload } from '../../domain/ports/token-provider.port';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async enroll(
    @Body() dto: EnrollDto,
    @CurrentUser() user: ITokenPayload,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentService.enroll({
      eventId: dto.eventId,
      userId: user.sub,
    });
    return EnrollmentResponseDto.fromDomain(enrollment);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string): Promise<CancellationResponseDto> {
    const result = await this.enrollmentService.cancel(id);
    return CancellationResponseDto.fromResult(result);
  }

  @Get('event/:eventId')
  async findByEvent(
    @Param('eventId') eventId: string,
  ): Promise<EnrollmentResponseDto[]> {
    const enrollments = await this.enrollmentService.findByEvent(eventId);
    return enrollments.map((enrollment) =>
      EnrollmentResponseDto.fromDomain(enrollment),
    );
  }
}
