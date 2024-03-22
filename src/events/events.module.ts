import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema, ManijaEvent } from './entities/event.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports:[MongooseModule.forFeature([{
    name:ManijaEvent.name,
    schema: EventSchema
  }]),
ScheduleModule.forRoot()]
})
export class EventsModule {}
