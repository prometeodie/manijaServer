import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus, Logger, Injectable, UseGuards, Query } from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, imgResizing } from 'src/helpers/image.helper';
import * as multer from 'multer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ManijaEvent } from './entities/event.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { PublicAccess } from 'src/decorators/public.decorator';
import { S3Service } from 'src/utils/s3/s3.service';
import { DeleteImgKeyDto } from './dto/delete-event-manija.dto';

 
@Injectable()
@Controller('events')
@UseGuards( AuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService, private readonly s3Service: S3Service ) {}

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
          const event = await this.eventsService.findOne(id);
          const originalName = file.originalname.replace(/\s+/g, '_');
    
          const [img800, img600] = await Promise.all([
            imgResizing(file, 800),
            imgResizing(file, 600),
          ]);
        
          const [key, keyMobile] = await Promise.all([
            this.s3Service.uploadFile(img800, originalName),
            this.s3Service.uploadFile(img600, `mobile-${originalName}`),
          ]);

          event.imgName = key;
          event.imgNameMobile = keyMobile;
          await this.eventsService.update(id, event);
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

  @Delete('delete-all-images/:id')
     @RolesAccess(Roles.ADMIN)
     async deleteAllImages(@Param('id') id: string, @Res() res: Response) {
       try{
         await this.eventsService.deleteAllImages(id);
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
       @Body() imgKey: DeleteImgKeyDto, 
       @Res() res: Response) {
       try{
         await this.eventsService.deleteImage(id,imgKey.key);
         return res.status(HttpStatus.OK).json({
           message: 'Image deleted successfully',
         });
       } catch (error) {
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
           message: 'Error deleting images',
         });
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

