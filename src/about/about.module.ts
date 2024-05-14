import { Module } from '@nestjs/common';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutSection, AboutSchema } from './entities/about.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AboutController],
  providers: [AboutService],
  imports:[
    MongooseModule.forFeature([{
    name:AboutSection.name,
    schema: AboutSchema
  }]),
  ScheduleModule.forRoot(),
  ]
})
export class AboutModule {}
