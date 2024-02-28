import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, saveImage } from 'src/helpers/image.helper';
import { Response } from 'express';

@Controller('blogsManijas')
export class BlogsManijasController {
  constructor(private readonly blogsManijasService: BlogsManijasService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file' , {
    storage: diskStorage({
      destination: './upload/images',
      filename: saveImage
    }),
    limits: {
      fileSize: 3145728
    },
    fileFilter: fileFilter
  }))
  public async create(
    @Body() createBlogsManijaDto: CreateBlogsManijaDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response ) {
    const blog = createBlogsManijaDto;

    await this.blogsManijasService.create(blog);

    return res.status(HttpStatus.OK).json({
      message:'Blog has been saved'
    })

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
  @UseInterceptors(FileInterceptor('file' , {
    storage: diskStorage({
      destination: './upload/images',
      filename: saveImage
    })
  }))
  public async update(@Param('id') id: string, @Body() updateBlogsManijaDto: UpdateBlogsManijaDto, @UploadedFile() file: Express.Multer.File ) {
    return await this.blogsManijasService.update(id, updateBlogsManijaDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this.blogsManijasService.remove(id);
  }
}
