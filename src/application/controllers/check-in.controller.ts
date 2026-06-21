// src/application/controllers/check-in.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CheckInService } from '../../domain/services/check-in.service';
import { CheckInResponseDto } from '../dtos/check-in-response.dto';
import { JwtAuthGuard } from '../../infrastructure/shared/guards/jwt-auth.guard';

@Controller('check-ins')
@UseGuards(JwtAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post('enrollment/:enrollmentId')
  @HttpCode(HttpStatus.CREATED)
  async checkIn(
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<CheckInResponseDto> {
    const checkIn = await this.checkInService.checkIn(enrollmentId);
    return CheckInResponseDto.fromDomain(checkIn);
  }

  @Get('event/:eventId')
  async findByEvent(
    @Param('eventId') eventId: string,
  ): Promise<CheckInResponseDto[]> {
    const checkIns = await this.checkInService.findByEvent(eventId);
    return checkIns.map((checkIn) => CheckInResponseDto.fromDomain(checkIn));
  }
}
