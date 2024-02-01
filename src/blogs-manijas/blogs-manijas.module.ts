import { Module } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { BlogsManijasController } from './blogs-manijas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema, BlogsManija } from './entities/blogs-manija.entity';

@Module({
  controllers: [BlogsManijasController],
  providers: [BlogsManijasService],
  imports:[MongooseModule.forFeature([{
    name:BlogsManija.name,
    schema: BlogSchema
  }])]
})
export class BlogsManijasModule {}
