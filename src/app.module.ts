import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { BoardgamesModule } from './boardgames/boardgames.module';
import { BlogsManijasModule } from './blogs-manijas/blogs-manijas.module';
import { EventsModule } from './events/events.module';
import { ContactModule } from './contact/contact.module';
import { AboutModule } from './about/about.module';
import { AdminSetupService } from './services/admin-setup/admin-setup.service';
import { S3Service } from './utils/s3/s3.service';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI), 
    AuthModule,
    AboutModule,
    BoardgamesModule,
    BlogsManijasModule, 
    EventsModule, 
    ContactModule],
  controllers: [],
  providers: [AdminSetupService, S3Service],
})
export class AppModule {
  constructor(private readonly adminSetupService: AdminSetupService) {}

  // async onModuleInit() {
  //   await this.adminSetupService.createAdminIfNotExist();
  // }
}