import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { BoardgamesModule } from './boardgames/boardgames.module';
import { BlogsManijasModule } from './blogs-manijas/blogs-manijas.module';
import { EventsModule } from './events/events.module';
import { ContactModule } from './contact/contact.module';
import { AboutController } from './about/about.controller';
import { AboutModule } from './about/about.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI), 
    AuthModule,
    BoardgamesModule,
    BlogsManijasModule, 
    EventsModule, 
    ContactModule, AboutModule],
  controllers: [AboutController],
  providers: [],
})
export class AppModule {}