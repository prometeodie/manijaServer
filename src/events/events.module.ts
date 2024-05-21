import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema, ManijaEvent } from './entities/event.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports:[MongooseModule.forFeature([{
    name:ManijaEvent.name,
    schema: EventSchema
  }]),
ScheduleModule.forRoot(),
AuthModule]
})
export class EventsModule {}
