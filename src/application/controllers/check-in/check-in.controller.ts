import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CheckInService } from '../../../domain/services/check-in/check-in.service';
import { CheckInResponseDto } from '../../dtos/check-in/check-in-response.dto';
import { JwtAuthGuard } from '../../../infrastructure/shared/guards/jwt-auth.guard';

@ApiTags('Check-in')
@ApiBearerAuth('JWT')
@Controller('check-ins')
@UseGuards(JwtAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post('enrollment/:enrollmentId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Realizar check-in (dentro da janela de tempo do evento)',
  })
  @ApiResponse({ status: 201, description: 'Check-in realizado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Fora da janela de tempo ou inscrição não confirmada',
  })
  @ApiResponse({
    status: 409,
    description: 'Check-in já realizado para esta inscrição',
  })
  async checkIn(
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<CheckInResponseDto> {
    const checkIn = await this.checkInService.checkIn(enrollmentId);
    return CheckInResponseDto.fromDomain(checkIn);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Listar check-ins de um evento' })
  @ApiResponse({ status: 200, description: 'Lista de check-ins' })
  async findByEvent(
    @Param('eventId') eventId: string,
  ): Promise<CheckInResponseDto[]> {
    const checkIns = await this.checkInService.findByEvent(eventId);
    return checkIns.map((c) => CheckInResponseDto.fromDomain(c));
  }
}
