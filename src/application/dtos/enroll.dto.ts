import { IsString, IsNotEmpty } from 'class-validator';

export class EnrollDto {
  @IsString()
  @IsNotEmpty()
  eventId!: string;
}
