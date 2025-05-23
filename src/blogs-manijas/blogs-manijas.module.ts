import { Module } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { BlogsManijasController } from './blogs-manijas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema, BlogsManija } from './entities/blogs-manija.entity';
import { AuthModule } from 'src/auth/auth.module';
import { S3Service } from 'src/utils/s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [BlogsManijasController],
  providers: [BlogsManijasService, S3Service],
  imports:[
    ConfigModule,
    MongooseModule.forFeature([{
    name:BlogsManija.name,
    schema: BlogSchema
  }]),
    AuthModule]
})
export class BlogsManijasModule {}
