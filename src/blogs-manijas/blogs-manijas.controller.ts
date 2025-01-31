
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, HttpStatus, UseGuards, Query, UploadedFile } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { Response } from 'express';
import { UploadImgDto } from './dto/upload-blogImg-manija.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { PublicAccess } from 'src/decorators/public.decorator';
import { BlogsCategories } from './utils/blogs-categories.enum';


@Controller('blogs')
@UseGuards( AuthGuard, RolesGuard)
export class BlogsManijasController {
  constructor(private readonly blogsManijasService: BlogsManijasService) {}
  
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

  @Post('uploadImg/:id')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    limits: {
      fileSize: 3145728
    },
    storage: diskStorage({
      destination: saveImage,
      filename: nameImg
    })
  }))
  @RolesAccess(Roles.ADMIN)
  public async uploadImg(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImgDto: UploadImgDto,
    @Param('id') id: string, 
  ){
    try{
      const blog = await this.blogsManijasService.findOne(id);
      const imgName = file.filename
      this.blogsManijasService.resizeImg(imgName,'regular-size', 600, id);
      this.blogsManijasService.resizeImg(imgName, 'optimize', 300, id);
      blog.imgName = imgName
      const {_id, ...newBlog} = blog.toJSON();
      const updatedBlog = {
        ...newBlog,
        itemName: id
      };
      this.blogsManijasService.update(id,updatedBlog)
      return res.status(HttpStatus.OK).json({
        message:'img has been saved',
      })
    }catch(error){
      const imgName = file.filename;
      const itemName =  id;
      this.blogsManijasService.deleteImgCatch(imgName,itemName)
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

  @Delete('delete/img/:path(*)')
  @RolesAccess(Roles.ADMIN)
  public async removeImg(@Param('path') path: string) {
    try {
      await this.blogsManijasService.deleteImage(path);
      return { success: true, message: 'Image deleted successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to delete image.', error: error.message };
    }
  }

}