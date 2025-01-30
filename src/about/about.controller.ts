
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, UploadedFile, HttpStatus, UseGuards} from '@nestjs/common';
import { Response } from 'express';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { fileFilter, nameImg } from 'src/helpers/image.helper';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { aboutSaveImage } from './helper/saveImg.helper';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { PublicAccess } from 'src/decorators/public.decorator';
import { UpdateAboutItemsOrderDto } from './dto/organize-item.dto';


@Controller('about')
@UseGuards(AuthGuard, RolesGuard)
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Post('upload')
  @RolesAccess(Roles.ADMIN)
  public async create(
    @Body() createAboutDto: CreateAboutDto,
    @Res() res: Response ) {
      try{
        const aboutSection = createAboutDto;
        const id = await this.aboutService.create(aboutSection);
        return res.status(HttpStatus.OK).json({
          message:'About section has been saved',
          _id:id,
        })
      }catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message:   `Error uploading the About Section ${error.message}`
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
      destination: aboutSaveImage,
      filename: nameImg
    })
  }))
  @RolesAccess(Roles.ADMIN)
  public async uploadImg(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string, 
  ){
    try{
      const aboutSection = await this.aboutService.findOne(id);
      const imgName = file.filename;
      this.aboutService.resizeImg(imgName, 'regular-size',600);
      this.aboutService.resizeImg(imgName, 'optimize', 300);
      aboutSection.imgName = imgName
      const {_id, ...newAboutSec} = aboutSection.toJSON();
      const updateAboutSection = newAboutSec;
      this.aboutService.update(id,updateAboutSection)
      return res.status(HttpStatus.OK).json({
        message:'img has been saved',
      })
    }catch(error){
      this.aboutService.deleteImgCatch(file.filename)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }


  @Get('admin')
  @RolesAccess(Roles.ADMIN)
  public async findAll( @Res() res: Response
  ) {
    try{
      const aboutSection = this.aboutService.sortItemsByPosition(await this.aboutService.findAll());
      return res.status(HttpStatus.OK).json(aboutSection);
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
      message: `Error finding the About Sections ${error.message}`
    });
  }
}

  @Get(':id')
  @PublicAccess()
  public async findOne(
    @Param('id') id: string,
    @Res() res: Response
    ) {
    try{
      const aboutSection = await this.aboutService.findOne(id);
      return res.status(HttpStatus.OK).json(aboutSection);
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error finding the about section ${error.message}`
      }); 
    }
  }

  @Get()
  @PublicAccess()
  public async findAllAvailableToPublish(@Res() res: Response){
    try{
      const aboutSection = this.aboutService.sortItemsByPosition( await this.aboutService.findPublishedAboutSections());
      return res.status(HttpStatus.OK).json(aboutSection);
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error finding the about section ${error.message}`
      }); 
    }
  }

  @Patch('edit/:id')
  @RolesAccess(Roles.ADMIN)
  public async update(
    @Param('id') id: string, 
    @Body() updateAboutDto: UpdateAboutDto,
    @Res() res: Response
    ) {
      try{
        const aboutSection = updateAboutDto;
        await this.aboutService.update(id, aboutSection);
        return res.status(HttpStatus.OK).json({
          message:'About Section has been actualized'
          })
      }
      catch(error){
        return res.status(HttpStatus.CONFLICT).json({
          message:`Failed to updated the About Section ${error.message}`
        })
      }
    }

    @Patch('update-order')
    @RolesAccess(Roles.ADMIN)
    async updateOrder(
      @Body() orderedIds: UpdateAboutItemsOrderDto[],
      @Res() res: Response) {
        try{
          await this.aboutService.updateOrder(orderedIds);
          return res.status(HttpStatus.OK).json({
            message: 'Order updated successfully'
            });
        }
        catch(error){
          return res.status(HttpStatus.CONFLICT).json({
            message:`Order updated failed ${error.message}`
          })
        }
  }

  @Delete('delete/:id')
  @RolesAccess(Roles.ADMIN)
  public async remove(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try{
      await this.aboutService.remove(id);
      return res.status(HttpStatus.OK).json({
        message:'Deleted'
      })   
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to delete the About Section ${error.message}`
      })      
  }}

  @Delete('delete/img/:path(*)')
  @RolesAccess(Roles.ADMIN)
      public async removeImg(@Param('path') path: string) {
        try {
          await this.aboutService.deleteImage(path);
          return { success: true, message: 'Image deleted successfully.' };
        } catch (error) {
          return { success: false, message:`Failed to delete the image ${error.message}` };
        }
      }
}
