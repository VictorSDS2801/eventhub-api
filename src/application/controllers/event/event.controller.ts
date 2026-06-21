import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EventService } from '../../../domain/services/event/event.service';
import { CreateEventDto } from '../../dtos/event/create-event.dto';
import { EventResponseDto } from '../../dtos/event/event-response.dto';
import { JwtAuthGuard } from '../../../infrastructure/shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/shared/guards/roles.guard';
import { Roles } from '../../../infrastructure/shared/guards/roles.decorator';
import { RoleEnum } from '../../../domain/entities/role.vo';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEventDto): Promise<EventResponseDto> {
    const event = await this.eventService.createEvent({
      title: dto.title,
      description: dto.description,
      organizerId: dto.organizerId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      capacityTotal: dto.capacityTotal,
    });
    return EventResponseDto.fromDomain(event);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.findById(id);
    return EventResponseDto.fromDomain(event);
  }

  @Get()
  async findAll(
    @Query('organizerId') organizerId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<EventResponseDto[]> {
    const events = await this.eventService.findAll({
      organizerId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return events.map((event) => EventResponseDto.fromDomain(event));
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
  async publish(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.publishEvent(id);
    return EventResponseDto.fromDomain(event);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
  async cancel(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.cancelEvent(id);
    return EventResponseDto.fromDomain(event);
  }
}
