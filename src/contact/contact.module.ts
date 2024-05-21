import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './entities/contact.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
  imports:[MongooseModule.forFeature([{
    name:Contact.name,
    schema: ContactSchema
  }]),
  ScheduleModule.forRoot(),
  AuthModule ]
})
export class ContactModule {}
