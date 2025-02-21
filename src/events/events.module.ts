import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema, ManijaEvent } from './entities/event.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'src/auth/auth.module';
import { S3Service } from 'src/utils/s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [EventsController],
  providers: [EventsService, S3Service],
  imports:[
    ConfigModule,
    MongooseModule.forFeature([{
    name:ManijaEvent.name,
    schema: EventSchema
  }]),
ScheduleModule.forRoot(),
AuthModule]
})
export class EventsModule {}
