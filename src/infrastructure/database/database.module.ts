import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventSchemaClass, EventSchema } from './schemas/event.schema';
import { UserSchemaClass, UserSchema } from './schemas/user.schema';
import { MongoEventRepository } from './repositories/mongo-event.repository';
import { MongoUserRepository } from './repositories/mongo-user.repository';
import { I_EVENT_REPOSITORY } from '../../domain/repositories/event.repository.interface';
import { I_USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

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
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
  ],
  providers: [
    { provide: I_EVENT_REPOSITORY, useClass: MongoEventRepository },
    { provide: I_USER_REPOSITORY, useClass: MongoUserRepository },
  ],
  exports: [I_EVENT_REPOSITORY, I_USER_REPOSITORY],
})
export class DatabaseModule {}
