import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus, UploadedFiles } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, imgResizing, nameImg, saveImage } from 'src/helpers/image.helper';
import { Response } from 'express';

@Controller('blogsManijas')
export class BlogsManijasController {
  constructor(private readonly blogsManijasService: BlogsManijasService) {}
  // TODO:acomodar patch para imagenes

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 1, {
    fileFilter: fileFilter,
    limits: {
      fileSize: 3145728
      // TODO:cambiar el tamano de img permitido segun la necesidad
    },
    storage: diskStorage({
      destination: saveImage,
      filename: nameImg
    })
  }))
  public async create(
    @Body() createBlogsManijaDto: CreateBlogsManijaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response ) {
      try{
        const blog = createBlogsManijaDto;
        this.blogsManijasService.resizeImg(blog,files);
        await this.blogsManijasService.create(blog);
        return res.status(HttpStatus.OK).json({
          message:'Blog has been saved',
        })
      } catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Error uploading the Blog ' + error.message
        });
      }
  }

  @Get()
  public async findAll() {
    return await this.blogsManijasService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return await this.blogsManijasService.findOne(id);
  }

  @Patch('edit/:id')
  @UseInterceptors(FilesInterceptor('files', 1, {
    fileFilter: fileFilter,
    limits: {
      fileSize: 3145728
    },
    storage: diskStorage({
      destination: saveImage,
      filename: nameImg
    })
  }))
  public async update(
    @Param('id') id: string, 
    @Body() updateBlogsManijaDto: UpdateBlogsManijaDto, 
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response ) {
      const blog = updateBlogsManijaDto;
      this.blogsManijasService.resizeImg(blog,files);
      await this.blogsManijasService.update(id, updateBlogsManijaDto);
      return res.status(HttpStatus.OK).json({
      message:'Blog has been actualized'
    })
  }

  @Delete('delete/:id')
  public async remove(@Param('id') id: string) {
    return await this.blogsManijasService.remove(id);
  }

  @Delete('delete/img/:path(*)')
  public async removeImg(@Param('path') path: string) {
    try {
      await this.blogsManijasService.deleteImage(path);
      return { success: true, message: 'Image deleted successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to delete image.', error: error.message };
    }
  }

}