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
        event.publish = false;
        this.eventsService.resizeImg(event.itemName,file);
        await this.eventsService.create(createEventDto, file);
        return res.status(HttpStatus.OK).json({
          message:'Event has been saved',
        })
      } catch(error){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Error uploading the Event ' + error.message
        });
      }
  }

  @Get()
  public async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch('edit/:id')
  public async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete('delete/:id')
  public async remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}


// TODO:manejar los errores de cada controller con try y catch
// TODO:ponerle un valor por defecto a publish,mustBeAutomaticallyDeleted y la fecha de creacion
// TODO: poder guardar las imagenes de cada blog 
// TODO:chekear si es un codigo hexzadecimal el del color
// TODO: crear un enum para la categoria
// TODO:revisar q puedas mandar algunas propiedades vacias
// TODO:hacer una funcion de borrado automatico cuando la fecha sea mayor a la del evento
// TODO: hacer que una funciopn para convertir en string en date a la hora de usar la funcion para borrar el evento una vez q la fecha pase
