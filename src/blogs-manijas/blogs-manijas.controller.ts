import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { renameImage } from 'src/helpers/image.helper';

@Controller('blogsManijas')
export class BlogsManijasController {
  constructor(private readonly blogsManijasService: BlogsManijasService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './upload/images',
      filename: renameImage
    })
  }))
  public async create(@Body() createBlogsManijaDto: CreateBlogsManijaDto, @UploadedFile() file: Express.Multer.File) {
    const blog = createBlogsManijaDto;
    blog.imgUrl = file.path;
    return await this.blogsManijasService.create(blog);
  }

  @Get()
  public async findAll() {
    return await this.blogsManijasService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return await this.blogsManijasService.findOne(id);
  }

  @Patch(':id')
  public async update(@Param('id') id: string, @Body() updateBlogsManijaDto: UpdateBlogsManijaDto) {
    return await this.blogsManijasService.update(id, updateBlogsManijaDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this.blogsManijasService.remove(id);
  }
}
