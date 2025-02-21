
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, UploadedFile, HttpStatus, UseGuards, Query} from '@nestjs/common';
import { Response } from 'express';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { fileFilter, imgResizing } from 'src/helpers/image.helper';
import * as multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { PublicAccess } from 'src/decorators/public.decorator';
import { UpdateAboutItemsOrderDto } from './dto/organize-item.dto';
import { DeleteAboutItemImgKeyDto } from './dto/delete-about-item-Img-manija.dto';
import { S3Service } from 'src/utils/s3/s3.service';


@Controller('about')
@UseGuards(AuthGuard, RolesGuard)
export class AboutController {
  constructor(private readonly aboutService: AboutService, private readonly s3Service: S3Service) {}

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
        const aboutItem = await this.aboutService.findOne(id);
        const originalName = file.originalname.replace(/\s+/g, '_');
  
        const [img800, img600] = await Promise.all([
          imgResizing(file, 800),
          imgResizing(file, 600),
        ]);
      
        const [key, keyMobile] = await Promise.all([
          this.s3Service.uploadFile(img800, originalName),
          this.s3Service.uploadFile(img600, `mobile-${originalName}`),
        ]);
        aboutItem.imgName = key;
        aboutItem.imgNameMobile = keyMobile;
        await this.aboutService.update(id, aboutItem);
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

@Get('character-average')
@RolesAccess(Roles.ADMIN) 
 public async getCharacterAverage(
   @Res() res: Response) {
   try {
     const charactersAverage = await this.aboutService.getCharacterAverage();
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

   @Delete('delete-all-images/:id')
    @RolesAccess(Roles.ADMIN)
    async deleteAllImages(@Param('id') id: string, @Res() res: Response) {
      try{
        await this.aboutService.deleteAllImages(id);
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
      @Body() imgKey: DeleteAboutItemImgKeyDto, 
      @Res() res: Response) {
      try{
        await this.aboutService.deleteImage(id,imgKey.key);
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