import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, UploadedFile, HttpStatus} from '@nestjs/common';
import { Response } from 'express';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { fileFilter, nameImg } from 'src/helpers/image.helper';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { aboutSaveImage } from './helper/saveImg.helper';


@Controller('about')
export class AboutController {

  constructor(private readonly aboutService: AboutService) {}

  @Post('upload')
  public async create(
    @Body() createAboutDto: CreateAboutDto,
    @Res() res: Response ) {
      try{
        const aboutSection = createAboutDto;
        await this.aboutService.create(aboutSection);
        return res.status(HttpStatus.OK).json({
          message:'About section has been saved',
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
  public async uploadImg(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string, 
  ){
    try{
      const aboutSection = await this.aboutService.findOne(id);
      const imgName = file.filename;
      this.aboutService.resizeImg(imgName)
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


  @Get()
  public async findAll( @Res() res: Response
  ) {
    try{
      const abourSection = await this.aboutService.findAll();
      return res.status(HttpStatus.OK).json(abourSection);
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
      message: `Error finding the About Sections ${error.message}`
    });
  }
}
  @Get(':id')
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

  @Patch('edit/:id')
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

  @Delete('delete/:id')
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
      public async removeImg(@Param('path') path: string) {
        try {
          await this.aboutService.deleteImage(path);
          return { success: true, message: 'Image deleted successfully.' };
        } catch (error) {
          return { success: false, message:`Failed to delete the image ${error.message}` };
        }
      }
}
