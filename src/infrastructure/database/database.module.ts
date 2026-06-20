import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventSchemaClass, EventSchema } from './schemas/event.schema';
import { MongoEventRepository } from './repositories/mongo-event.repository';
import { I_EVENT_REPOSITORY } from '../../domain/repositories/event.repository.interface';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: EventSchemaClass.name, schema: EventSchema },
    ]),
  ],
  providers: [
    {
      provide: I_EVENT_REPOSITORY,
      useClass: MongoEventRepository,
    },
  ],
  exports: [I_EVENT_REPOSITORY],
})
export class DatabaseModule {}
