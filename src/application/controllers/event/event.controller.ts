import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EventService } from '../../../domain/services/event/event.service';
import { CreateEventDto } from '../../dtos/event/create-event.dto';
import { EventResponseDto } from '../../dtos/event/event-response.dto';
import { JwtAuthGuard } from '../../../infrastructure/shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/shared/guards/roles.guard';
import { Roles } from '../../../infrastructure/shared/guards/roles.decorator';
import { RoleEnum } from '../../../domain/entities/user/role.vo';
import { I_CACHE } from '../../../domain/ports/cache.port';
import type { ICache } from '../../../domain/ports/cache.port';

const EVENT_LIST_CACHE_PREFIX = 'events:list:';
const EVENT_LIST_CACHE_TTL_SECONDS = 60;

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    @Inject(I_CACHE)
    private readonly cache: ICache,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Criar novo evento (ORGANIZER/ADMIN)' })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@Body() dto: CreateEventDto): Promise<EventResponseDto> {
    const event = await this.eventService.createEvent({
      title: dto.title,
      description: dto.description,
      organizerId: dto.organizerId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      capacityTotal: dto.capacityTotal,
    });
    await this.cache.deleteByPrefix(EVENT_LIST_CACHE_PREFIX);
    return EventResponseDto.fromDomain(event);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos (com cache Redis de 60s)' })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  @ApiQuery({ name: 'organizerId', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED'],
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('organizerId') organizerId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<EventResponseDto[]> {
    const filters = {
      organizerId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    const cacheKey = `${EVENT_LIST_CACHE_PREFIX}${JSON.stringify(filters)}`;

    const cached = await this.cache.get<EventResponseDto[]>(cacheKey);
    if (cached) return cached;

    const events = await this.eventService.findAll(filters);
    const response = events.map((event) => EventResponseDto.fromDomain(event));
    await this.cache.set(cacheKey, response, EVENT_LIST_CACHE_TTL_SECONDS);
    return response;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar evento por ID' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async findById(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.findById(id);
    return EventResponseDto.fromDomain(event);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Publicar evento (ORGANIZER/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Evento publicado' })
  async publish(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.publishEvent(id);
    await this.cache.deleteByPrefix(EVENT_LIST_CACHE_PREFIX);
    return EventResponseDto.fromDomain(event);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ORGANIZER, RoleEnum.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cancelar evento (ORGANIZER/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Evento cancelado' })
  async cancel(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.eventService.cancelEvent(id);
    await this.cache.deleteByPrefix(EVENT_LIST_CACHE_PREFIX);
    return EventResponseDto.fromDomain(event);
  }
}
