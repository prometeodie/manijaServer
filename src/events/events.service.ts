import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ManijaEvent } from './entities/event.entity';
import { imgResizing } from 'src/helpers/image.helper';
import * as fs from 'node:fs';


@Injectable()

export class EventsService {

  readonly commonPath: string = 'upload/EVENTS';

  constructor(
    @InjectModel(ManijaEvent.name)
    private manijaEventModel: Model<ManijaEvent>){}

  async create(createEventDto: CreateEventDto) {
    try{
      const newEvent = await new this.manijaEventModel( createEventDto );
      newEvent.creationDate = new Date;
      await newEvent.save()
      return newEvent.id;
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

  async findOne(id: string) {
    try{      
      const event = await this.manijaEventModel.findById(id)
      if ( !event ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'event does not exist'
        })
      }
      return event;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findPublishedAboutSections(): Promise<ManijaEvent[]>{
    try{
      return await this.manijaEventModel.find({ publish: true }).exec();
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    try{
      const event = await this.manijaEventModel.findByIdAndUpdate(id, updateEventDto, { new: true } );
      if (!event) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'event does not exist'
        })
      }
      return event;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async remove(id: string,) {
    try{
      const event = await this.manijaEventModel.findByIdAndDelete(id)
      if ( !event ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'event does not exist'
        })}
      return event;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteImage(imagePath: string) {
    try{
      const fs = require('fs').promises
      await fs.rm(imagePath, { recursive: true })
    return true;
  } catch (error){
    console.error('Something wrong happened removing the file', error)
    throw error;
  }
}

  async resizeImg(fileName: string, itemName: string){
      try{
        if(fileName){
          const path = `${this.commonPath}/${itemName}`
          try{
            await imgResizing(path,fileName,500)
          }catch(error){
            console.error('Something wrong happened resizing the image', error)
            throw error;    
          }
        }
      }catch(error){
        console.error('Something wrong happened resizing the image', error)
        throw error;    
      }
  }

  deleteImgCatch(fileName: string, itemName: string){
    const imgPath = `${this.commonPath}/${itemName}/${fileName}`
      setTimeout(()=>{
        if (fs.existsSync(imgPath)) {
        this.deleteImage(imgPath)
          }
        },5000)
      }

  async eliminarObjetosVencidos(): Promise<void> {
    const currentDate = new Date();
    try{
      await this.manijaEventModel.deleteMany({ eventDate: { $lt: currentDate, mustBeAutomaticallyDeleted: true } });
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
