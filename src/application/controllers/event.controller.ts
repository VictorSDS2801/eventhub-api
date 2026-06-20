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
} from '@nestjs/common';
import { EventService } from '../../domain/services/event.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { EventResponseDto } from '../dtos/event-response.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
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
  async publish(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.publishEvent(id);
    return EventResponseDto.fromDomain(event);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.cancelEvent(id);
    return EventResponseDto.fromDomain(event);
  }
}
