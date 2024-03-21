import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { diskStorage } from 'multer';


@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

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
        message: 'Error finding the Events ' + error.message
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
        if (!event) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Blog was not found.',
        });
      }
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
          const event = updateEventDto;
          this.eventsService.resizeImg(event.itemName,file);
          return this.eventsService.update(+id, updateEventDto);
        }
        catch(error){
          return res.status(HttpStatus.CONFLICT).json({
            message:'Failed to updated the blog'
          })
        }
      }
      
      @Delete('delete/:id')
      public async remove(
        @Param('id') id: string,
        @Res() res: Response){
          try{
            return this.eventsService.remove(id);
          }catch(error){
            return res.status(HttpStatus.CONFLICT).json({
              message:'Failed to delete the blog'
            })      
        }
      }

      @Delete('delete/img/:path(*)')
      public async removeImg(@Param('path') path: string) {
        try {
          await this.eventsService.deleteImage(path);
          return { success: true, message: 'Image deleted successfully.' };
        } catch (error) {
          return { success: false, message: 'Failed to delete image.', error: error.message };
        }
      }
}

// TODO:ver como evitar q cargue la imagen si al postear surge cualquier tipo de error en post y en patch
// TODO: crear un enum para la categoria
// TODO:revisar q puedas mandar algunas propiedades vacias
// TODO:hacer una funcion de borrado automatico cuando la fecha sea mayor a la del evento
