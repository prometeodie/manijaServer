
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, HttpStatus, UploadedFiles, UseGuards } from '@nestjs/common';
import { BlogsManijasService } from './blogs-manijas.service';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { Response } from 'express';
import { UploadImgDto } from './dto/upload-blogImg-manija.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { PublicAccess } from 'src/decorators/public.decorator';


@Controller('blogsManijas')
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
        await this.blogsManijasService.create(blog);
        return res.status(HttpStatus.OK).json({
          message:'Blog has been saved',
        })
      } catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Error uploading the Blog ${error.message}`
        });
      }
  }

  @Post('uploadImg/:id')
  @UseInterceptors(FilesInterceptor('files', 4, {
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
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadImgDto: UploadImgDto,
    @Param('id') id: string, 
  ){
    try{
      const blog = await this.blogsManijasService.findOne(id);
      const imgNames = files.map(file => {return file.filename;})
      this.blogsManijasService.resizeImg(imgNames, uploadImgDto.itemName)
      imgNames.map(img=> blog.imgName.push(img));
      const {_id, ...newBlog} = blog.toJSON();
      const updatedBlog = newBlog;
      this.blogsManijasService.update(id,updatedBlog)
      return res.status(HttpStatus.OK).json({
        message:'img has been saved',
      })
    }catch(error){
      this.blogsManijasService.deleteImgCatch(uploadImgDto, files)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

  @Get('admin')
  @RolesAccess(Roles.ADMIN)
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

  @Get()
  @PublicAccess()
  public async findAllAvailableToPublish(@Res() res: Response){
    try{
      const blogs = await this.blogsManijasService.findPublishedAboutSections();
      return res.status(HttpStatus.OK).json(blogs);
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error finding Blogs ${error.message}`
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