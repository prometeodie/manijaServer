import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus, Logger, Injectable, UseGuards } from '@nestjs/common';
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
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { PublicAccess } from 'src/decorators/public.decorator';
 
@Injectable()
@Controller('events')
@UseGuards( AuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  private readonly logger = new Logger(ManijaEvent.name);

  @Post('upload')
  @RolesAccess(Roles.ADMIN)
  public async create(
    @Body() createEventDto: CreateEventDto,
    @Res() res: Response ) {
      try{

        const event = createEventDto;
        const regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;

        if(event.mustBeAutomaticallyDeleted){
          const currentDate = new Date();
          if (event.eventDate && new Date(event.eventDate) < currentDate) {
            return res.status(HttpStatus.BAD_REQUEST).json({
              message: 'eventDate cannot be in the past',
            });
          }
        }

        if (!regex.test(event.eventColor)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'eventColor has not an hexadecimal format',
          });
        }

        const id = await this.eventsService.create(createEventDto);
        return res.status(HttpStatus.OK).json({
        message: 'Event has been saved',
        _id:id
    });
      } catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message:   `Error uploading the Event ${error.message}`
        });
      }
  }

  @Post('uploadImg/:id')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter,
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
      const event = await this.eventsService.findOne(id);
      const imgName = file.filename;
      this.eventsService.resizeImg(imgName, id);
      event.imgName = imgName
      const {_id, ...newEvent} = event.toJSON();
      const updatedBlog = {
        ...newEvent,
        itemName: id
      };
      this.eventsService.update(id,updatedBlog)
      return res.status(HttpStatus.OK).json({
        message:'img has been saved',
      })
    }catch(error){
      const imgName = file.filename;
      const itemName =  id;
      this.eventsService.deleteImgCatch(imgName,itemName)
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
  @RolesAccess(Roles.ADMIN)
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

    @Get()
    @PublicAccess()
    public async findAllAvailableToPublish(@Res() res: Response){
      try{
        const events = await this.eventsService.findPublishedAboutSections();
        return res.status(HttpStatus.OK).json(events);
      }catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Error finding events ${error.message}`
        }); 
      }
    }
    
    @Patch('edit/:id')
    @RolesAccess(Roles.ADMIN)
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
      @RolesAccess(Roles.ADMIN)
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
      @RolesAccess(Roles.ADMIN)
      public async removeImg(@Param('path') path: string) {
        try {
          await this.eventsService.deleteImage(path);
          return { success: true, message: 'Image deleted successfully.' };
        } catch (error) {
          return { success: false, message:`Failed to delete the image ${error.message}` };
        }
      }


      @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
      @PublicAccess()
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

