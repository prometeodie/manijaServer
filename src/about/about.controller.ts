import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, UploadedFile, HttpStatus} from '@nestjs/common';
import { Response } from 'express';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { diskStorage } from 'multer';



@Controller('about')
export class AboutController {

  constructor(private readonly aboutService: AboutService) {}

  @Post('upload')
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
  public async create(
    @Body() createAboutDto: CreateAboutDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response ) {
      try{
        const aboutSection = createAboutDto;
        this.aboutService.resizeImg(aboutSection.itemName,file);
        await this.aboutService.create(createAboutDto, file);
        return res.status(HttpStatus.OK).json({
          message:'About section has been saved',
        })
      }catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message:   `Error uploading the About Section ${error.message}`
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
  public async update(
    @Param('id') id: string, 
    @Body() updateAboutDto: UpdateAboutDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
    ) {
      try{
        await this.aboutService.update(id, updateAboutDto);
        const aboutSection = updateAboutDto;
        this.aboutService.resizeImg(aboutSection.itemName,file);
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
