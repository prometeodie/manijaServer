import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ManijaEvent } from './entities/event.entity';
import { imgResizing } from 'src/helpers/image.helper';

@Injectable()

export class EventsService {


  constructor(
    @InjectModel(ManijaEvent.name)
    private manijaEventModel: Model<ManijaEvent>
  ){}

  async create(createEventDto: CreateEventDto, file:Express.Multer.File) {
    try{
      const newEvent = await new this.manijaEventModel( createEventDto );
      newEvent.creationDate = new Date;
      newEvent.mustBeAutomaticallyDeleted = false;
      newEvent.publish = false;
      newEvent.creationDate = new Date;
      newEvent.imgName = file.filename;
      return newEvent.save()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAll() {
    try{
      return await this.manijaEventModel.find()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findOne(id: number) {
    try{
      const blog = await this.manijaEventModel.findById(id)
      if ( !blog ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'event does not exist'
        })
      }
      return blog;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    try{
      return await this.manijaEventModel.findByIdAndUpdate(id, updateEventDto, { new: true } );
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async remove(id: number) {
    try{
      const blog = await this.manijaEventModel.findByIdAndDelete(id)
      if ( !blog ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'event does not exist'
        })
      }
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  resizeImg(itemName:string ,file: Express.Multer.File){
      if(file){
        const path = `upload/events/${itemName}`
       imgResizing(`${path}`,path,file.filename,300);
      }
  }
}
