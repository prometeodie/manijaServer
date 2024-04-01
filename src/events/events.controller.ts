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

@Injectable()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  private readonly logger = new Logger(ManijaEvent.name);

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
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response ) {
      try{
        const event = createEventDto;
        const regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;
        if (regex.test(event.eventColor)) {
          event.publish = false;
          this.eventsService.resizeImg(event.itemName,file);
          await this.eventsService.create(createEventDto, file);
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

  @Get()
  public async findAll(
    @Res() res: Response
    ) {
      try{
        const events = await this.eventsService.findAll();
        return res.status(HttpStatus.OK).json(events);
      }catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
        message: `'Error finding the Events ${error.message}`
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
      @Body() updateEventDto: UpdateEventDto,
      @UploadedFile() file: Express.Multer.File,
      @Res() res: Response
      ) {
        try{
          const updatedEvent = this.eventsService.update(id, updateEventDto);;
          const event = updateEventDto;
          this.eventsService.resizeImg(event.itemName,file);
          return res.status(HttpStatus.OK).json({
            message:'Event has been actualized'
            })
        }
        catch(error){
          return res.status(HttpStatus.CONFLICT).json({
            message:`Failed to updated the blog ${error.message}`
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
              message:`Failed to delete the blog ${error.message}`
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

// TODO:ver como evitar q cargue la imagen si al postear surge cualquier tipo de error en post y en patch

