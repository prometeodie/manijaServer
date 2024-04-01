import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './entities/contact.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
  imports:[MongooseModule.forFeature([{
    name:Contact.name,
    schema: ContactSchema
  }]),
  ScheduleModule.forRoot()]
})
export class ContactModule {}
