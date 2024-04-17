import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, HttpStatus, UploadedFiles } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { Response } from 'express';


@Controller('blogsManijas')
export class BlogsManijasController {
  constructor(private readonly blogsManijasService: BlogsManijasService) {}
  
  @Post('upload')
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
  public async create(
    @Body() createBlogsManijaDto: CreateBlogsManijaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response ) {
      try{
        const blog = createBlogsManijaDto;
        blog.publish = false;
        this.blogsManijasService.resizeImg(blog,files);
        await this.blogsManijasService.create(blog, files);
        return res.status(HttpStatus.OK).json({
          message:'Blog has been saved',
        })
      } catch(error){
          this.blogsManijasService.deleteImgCatch(files, createBlogsManijaDto)
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Error uploading the Blog ${error.message}`
        });
      }
  }

  @Get()
  public async findAll(
    @Res() res: Response
    ) {
      try {
        const blogs = await this.blogsManijasService.findAll();
        return res.status(HttpStatus.OK).json(blogs);
      } catch (error) {
        console.error('Error:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `There was an error processing the request ${error.message}`,
        });
      }
    }
    
    @Get(':id')
    public async findOne(
      @Param('id') id: string,
      @Res() res: Response
    ) {
    try {
      const blog = await this.blogsManijasService.findOne(id);
      return res.status(HttpStatus.OK).json(blog);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error finding the Blog ${error.message}`
      });
    }
  }

  @Patch('edit/:id')
  @UseInterceptors(FilesInterceptor('files', 1, {
    fileFilter: fileFilter,
    limits: {
      fileSize: 3145728
    },
    storage: diskStorage({
      destination: saveImage,
      filename: nameImg,
    })
  }))
  public async update(
    @Param('id') id: string, 
    @Body() updateBlogsManijaDto: UpdateBlogsManijaDto, 
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response ) {
      try{
        const blog = updateBlogsManijaDto;
        this.blogsManijasService.resizeImg(blog,files);
        await this.blogsManijasService.update(id, updateBlogsManijaDto);
        return res.status(HttpStatus.OK).json({
        message:'Blog has been actualized'
        })
    }catch(error){
        this.blogsManijasService.deleteImgCatch(files, updateBlogsManijaDto)
        // TODO:buscar una mejor la solucion para evitar que se carguen imagenes en caso de que haya un error, ponerlo en el servicio apra reutilizarlo en post tamb
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to updated the blog ${error.message}`
      })
    }
  }

  @Delete('delete/:id')
  public async remove(
    @Param('id') id: string,
    @Res() res: Response) {
      try{
        await this.blogsManijasService.remove(id);
        return res.status(HttpStatus.OK).json({
          message:'Blog has been deleted'
        })
      }catch(error){
        return res.status(HttpStatus.CONFLICT).json({
          message:'Failed to delete Blog'
        })
      }
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