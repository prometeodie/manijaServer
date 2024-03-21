import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema, ManijaEvent } from './entities/event.entity';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports:[MongooseModule.forFeature([{
    name:ManijaEvent.name,
    schema: EventSchema
  }])]
})
export class EventsModule {}
