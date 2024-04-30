import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus, Logger, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { diskStorage } from 'multer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ManijaEvent } from './entities/event.entity';
import { UploadImgDto } from './dto/upload-eventsImg-manija.dto';
 
@Injectable()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  private readonly logger = new Logger(ManijaEvent.name);

  @Post('upload')
  public async create(
    @Body() createEventDto: CreateEventDto,
    @Res() res: Response ) {
      try{
        const event = createEventDto;
        const regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;
        if (regex.test(event.eventColor)) {
          await this.eventsService.create(createEventDto);
          return res.status(HttpStatus.OK).json({
            message:'Event has been saved',
          })
        } else {
          return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'eventColor has not an hexadecimal format '
          });
        }
      } catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message:   `Error uploading the Event ${error.message}`
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
  public async uploadImg(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImgDto: UploadImgDto,
    @Param('id') id: string, 
  ){
    try{
      const event = await this.eventsService.findOne(id);
      const imgName = file.filename;
      this.eventsService.resizeImg(imgName, uploadImgDto.itemName)
      event.imgName = imgName
      const {_id, ...newEvent} = event.toJSON();
      const updatedBlog = {
        ...newEvent,
        itemName: uploadImgDto.itemName
      };
      this.eventsService.update(id,updatedBlog)
      return res.status(HttpStatus.OK).json({
        message:'img has been saved',
      })
    }catch(error){
      const imgName = file.filename;
      const itemName =  uploadImgDto.itemName;
      this.eventsService.deleteImgCatch(imgName,itemName)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

  @Get()
  public async findAll(
    @Res() res: Response
    ) {
      try{
        const events = await this.eventsService.findAll();
        return res.status(HttpStatus.OK).json(events);
      }catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error finding the Events ${error.message}`
      });
    }
  }
  
  @Get(':id')
  public async findOne(
    @Param('id') id: string,
    @Res() res: Response
    ) {
      try{
        const event = await this.eventsService.findOne(id);
        return res.status(HttpStatus.OK).json(event);
      }catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Error finding the Event ${error.message}`
        }); 
      }
    }
    
    @Patch('edit/:id')
    public async update(
      @Param('id') id: string, 
      @Body() updateEventDto: UpdateEventDto,
      @Res() res: Response
      ) {
        try{
          const event = updateEventDto;
          await this.eventsService.update(id, event);;
          return res.status(HttpStatus.OK).json({
            message:'Event has been actualized'
            })
        }
        catch(error){
          return res.status(HttpStatus.CONFLICT).json({
            message:`Failed to updated the event ${error.message}`
          })
        }
      }
      
      @Delete('delete/:id')
      public async remove(
        @Param('id') id: string,
        @Res() res: Response){
          try{
            await this.eventsService.remove(id);
            return res.status(HttpStatus.OK).json({
              message:'Deleted'
            })   
          }catch(error){
            return res.status(HttpStatus.CONFLICT).json({
              message:`Failed to delete the event ${error.message}`
            })      
        }
      }

      @Delete('delete/img/:path(*)')
      public async removeImg(@Param('path') path: string) {
        try {
          await this.eventsService.deleteImage(path);
          return { success: true, message: 'Image deleted successfully.' };
        } catch (error) {
          return { success: false, message:`Failed to delete the image ${error.message}` };
        }
      }


      @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
      async handleCron() {
        this.logger.debug('executing job to delete expired events');
        try {
          await this.eventsService.eliminarObjetosVencidos();
          this.logger.debug('expired events deleted correctly.');
        } catch (error) {
          this.logger.error(`Error to delete expired events: ${error.message}`);
        }
      }
}

