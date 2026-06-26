/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from './infrastructure/shared/config/config.module';
import { EventModule } from './event.module';
import { IdentityModule } from './identity.module';
import { EnrollmentModule } from './enrollment.module';
import { CheckInModule } from './check-in.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        serializers: {
          req(req: any) {
            return {
              method: req.method,
              url: req.url,
            };
          },
          res(res: any) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
        autoLogging: {
          ignore: (req: any) => req.url === '/health',
        },
      },
    }),
    EventModule,
    IdentityModule,
    EnrollmentModule,
    CheckInModule,
  ],
})
export class AppModule {}
