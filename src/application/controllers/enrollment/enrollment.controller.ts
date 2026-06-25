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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnrollmentService } from '../../../domain/services/enrollment/enrollment.service';
import { EnrollDto } from '../../dtos/enrollment/enroll.dto';
import { EnrollmentResponseDto } from '../../dtos/enrollment/enrollment-response.dto';
import { CancellationResponseDto } from '../../dtos/enrollment/cancellation-response.dto';
import { JwtAuthGuard } from '../../../infrastructure/shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../infrastructure/shared/decorators/current-user.decorator';
import type { ITokenPayload } from '../../../domain/ports/token-provider.port';

@ApiTags('Enrollments')
@ApiBearerAuth('JWT')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscrever-se em um evento' })
  @ApiResponse({
    status: 201,
    description: 'Inscrito com sucesso (CONFIRMED ou WAITLISTED)',
  })
  @ApiResponse({ status: 409, description: 'Usuário já inscrito neste evento' })
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
  @ApiOperation({ summary: 'Cancelar inscrição' })
  @ApiResponse({
    status: 200,
    description:
      'Inscrição cancelada. Campo promoted indica se um suplente foi promovido.',
  })
  async cancel(@Param('id') id: string): Promise<CancellationResponseDto> {
    const result = await this.enrollmentService.cancel(id);
    return CancellationResponseDto.fromResult(result);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Listar inscrições de um evento' })
  @ApiResponse({ status: 200, description: 'Lista de inscrições' })
  async findByEvent(
    @Param('eventId') eventId: string,
  ): Promise<EnrollmentResponseDto[]> {
    const enrollments = await this.enrollmentService.findByEvent(eventId);
    return enrollments.map((e) => EnrollmentResponseDto.fromDomain(e));
  }
}
