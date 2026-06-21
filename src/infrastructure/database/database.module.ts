import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventSchemaClass, EventSchema } from './schemas/event.schema';
import { UserSchemaClass, UserSchema } from './schemas/user.schema';
import {
  EnrollmentSchemaClass,
  EnrollmentSchema,
} from './schemas/enrollment.schema';
import { CheckInSchemaClass, CheckInSchema } from './schemas/check-in.schema';
import { MongoEventRepository } from './repositories/mongo-event.repository';
import { MongoUserRepository } from './repositories/mongo-user.repository';
import { MongoEnrollmentRepository } from './repositories/mongo-enrollment.repository';
import { MongoCheckInRepository } from './repositories/mongo-check-in.repository';
import { I_EVENT_REPOSITORY } from '../../domain/repositories/event.repository.interface';
import { I_USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { I_ENROLLMENT_REPOSITORY } from '../../domain/repositories/enrollment.repository.interface';
import { I_CHECKIN_REPOSITORY } from '../../domain/repositories/check-in.repository.interface';

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
      { name: EnrollmentSchemaClass.name, schema: EnrollmentSchema },
      { name: CheckInSchemaClass.name, schema: CheckInSchema },
    ]),
  ],
  providers: [
    { provide: I_EVENT_REPOSITORY, useClass: MongoEventRepository },
    { provide: I_USER_REPOSITORY, useClass: MongoUserRepository },
    { provide: I_ENROLLMENT_REPOSITORY, useClass: MongoEnrollmentRepository },
    { provide: I_CHECKIN_REPOSITORY, useClass: MongoCheckInRepository },
  ],
  exports: [
    I_EVENT_REPOSITORY,
    I_USER_REPOSITORY,
    I_ENROLLMENT_REPOSITORY,
    I_CHECKIN_REPOSITORY,
  ],
})
export class DatabaseModule {}
