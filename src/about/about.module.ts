import { Module } from '@nestjs/common';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutSection, AboutSchema } from './entities/about.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'src/auth/auth.module';
import { S3Service } from 'src/utils/s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AboutController],
  providers: [AboutService, S3Service],
  imports:[
    ConfigModule,
    MongooseModule.forFeature([{
    name:AboutSection.name,
    schema: AboutSchema
  }]),
  ScheduleModule.forRoot(),
  AuthModule
  ]
})
export class AboutModule {}
