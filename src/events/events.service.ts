import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ManijaEvent } from './entities/event.entity';
import { S3Service } from 'src/utils/s3/s3.service';


@Injectable()

export class EventsService {

  readonly commonPath: string = 'upload/EVENTS';

  constructor(
    @InjectModel(ManijaEvent.name)
    private manijaEventModel: Model<ManijaEvent>,
    private readonly s3Service: S3Service){}

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
      this.deleteAllImages(id);
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

async deleteAllImages(id) {
  const event = await this.findOne(id);
      if (!event) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'event does not exist'
        })
      }
      try {
        const deletePromises = [];

        if (event.imgName) {
          deletePromises.push(this.s3Service.deleteFile(event.imgName));
          event.imgName = null;
        }
      
        if (event.imgMobileName) {
          deletePromises.push(this.s3Service.deleteFile(event.imgMobileName));
          event.imgMobileName = null;
        }
      
        if (deletePromises.length) {
          await Promise.all(deletePromises);
        }
}catch(error){
  throw ErrorManager.createSignatureError(error.message);
}
}

async deleteImage(id:string){
  try{
    const event = await this.findOne(id);
    if(event){
      await Promise.all([
        await this.s3Service.deleteFile(event.imgName),
        await this.s3Service.deleteFile(event.imgMobileName)
      ]);
      event.imgName = null;
      event.imgMobileName = null;
    
      await this.update(id, event);
    }
  }catch(error){
    throw ErrorManager.createSignatureError(error.message);
  } 
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
