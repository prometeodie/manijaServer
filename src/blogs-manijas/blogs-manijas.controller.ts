
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, HttpStatus, UseGuards, Query, UploadedFile } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, imgResizing } from 'src/helpers/image.helper';
import { Response } from 'express';

import { RolesGuard } from 'src/guards/roles.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { PublicAccess } from 'src/decorators/public.decorator';
import { BlogsCategories } from './utils/blogs-categories.enum';
import * as multer from 'multer';
import { S3Service } from 'src/utils/s3/s3.service';



@Controller('blogs')
@UseGuards( AuthGuard, RolesGuard)
export class BlogsManijasController {
  constructor(private readonly blogsManijasService: BlogsManijasService, private readonly s3Service: S3Service) {}
  
  @Post('upload')
  @RolesAccess(Roles.ADMIN)
  public async create(
    @Body() createBlogsManijaDto: CreateBlogsManijaDto,
    @Res() res: Response ) {
      try{
        const blog = createBlogsManijaDto;
        const id = await this.blogsManijasService.create(blog);
        return res.status(HttpStatus.OK).json({
          message:'Blog has been saved',
          _id:id
        })
      } catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Error uploading the Blog ${error.message}`
        });
      }
  }

  @Post('upload-image/:id')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    limits: {
      fileSize: 3145728
    },
    storage: multer.memoryStorage(),
  }))
  @RolesAccess(Roles.ADMIN)
  public async uploadImg(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string, 
  ){
 
    try{
      const blog = await this.blogsManijasService.findOne(id);
      const originalName = file.originalname.replace(/\s+/g, '_');
      const newName = `${Date.now()}-${originalName}`;

      const [img800, img600] = await Promise.all([
        imgResizing(file, 800),
        imgResizing(file, 600),
      ]);
    
      const [key, keyMobile] = await Promise.all([
                  this.s3Service.uploadFile(img800, newName),
                  this.s3Service.uploadFile(img600,`mobile-${newName}`),
      ]);
      blog.imgName = key;
      blog.imgMobileName = keyMobile;
      await this.blogsManijasService.update(id, blog);
      return res.status(HttpStatus.OK).json({
        message:'img has been saved',
        })
    }catch(error){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

  @Get('admin')
  @RolesAccess(Roles.ADMIN)
  public async findAll(
    @Query('category') category: BlogsCategories,
    @Query('page') page: number = 1, 
    @Res() res: Response
  ) {
    try {
      const limit = 10; 
      const offset = (page - 1) * limit;
      const blogs = await this.blogsManijasService.findAllWithFilters(category, limit, offset, false);

      return res.status(HttpStatus.OK).json(blogs);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request: ${error.message}`,
      });
    }
  }

  @Get('character-average')
  @RolesAccess(Roles.ADMIN) 
   public async getCharacterAverage(
     @Res() res: Response) {
     try {
       const charactersAverage = await this.blogsManijasService.getCharacterAverage();
       return res.status(HttpStatus.OK).json({charactersAverage: charactersAverage});
     } catch (error) {
       console.error('Error:', error);
       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
         message: `There was an error processing the request: ${error.message}`,
       });
     }
   }

  @Get('img-url')
  @PublicAccess()
   public async getSignedUrl(
    @Query('key') key: string,
     @Res() res: Response) {
     try {
      if (!key) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Missing query parameter: key',
        });
      }
       const signedUrl = await this.s3Service.getSignedUrl(key);
       return res.status(HttpStatus.OK).json({signedUrl});
     } catch (error) {
       console.error('Error:', error);
       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
         message: `There was an error processing the request: ${error.message}`,
       });
     }
   }

  @Get()
  @PublicAccess()
    public async findAllAvailableToPublish(
      @Query('category') category: BlogsCategories,
      @Query('page') page: number = 1, 
      @Res() res: Response
    ) {
      try {
        const limit = 10; 
        const offset = (page - 1) * limit;
        const blogs = await this.blogsManijasService.findAllWithFilters(category, limit, offset, true);
  
        return res.status(HttpStatus.OK).json(blogs);
      } catch (error) {
        console.error('Error:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `There was an error processing the request: ${error.message}`,
        });
      }
    }

    @Get(':id')
    @PublicAccess()
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
  @RolesAccess(Roles.ADMIN)
  public async update(
    @Param('id') id: string, 
    @Body() updateBlogsManijaDto: UpdateBlogsManijaDto, 
    @Res() res: Response ) {
      try{
        const blog = updateBlogsManijaDto;
        await this.blogsManijasService.update(id, updateBlogsManijaDto);
        return res.status(HttpStatus.OK).json({
        message:'Blog has been actualized'
        })
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to updated the blog ${error.message}`
      })
    }
  }

  @Delete('delete/:id')
  @RolesAccess(Roles.ADMIN)
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

  @Delete('delete-all-images/:id')
  @RolesAccess(Roles.ADMIN)
  async deleteAllImages(@Param('id') id: string, @Res() res: Response) {
    try{
      await this.blogsManijasService.deleteAllImages(id);
      return res.status(HttpStatus.OK).json({
        message: 'Images deleted successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error deleting images',
      });
    }
  }
  
  @Delete('delete-image/:id')
  @RolesAccess(Roles.ADMIN)
  async deleteImage(
    @Param('id') id: string,
    @Query('imgKey') imgKey: string, 
    @Res() res: Response) {
    try{
      await this.blogsManijasService.deleteImage(id);
      return res.status(HttpStatus.OK).json({
        message: 'Image deleted successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error deleting images',
      });
    }
  }

}