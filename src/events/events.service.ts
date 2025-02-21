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

async resizeImg(fileName: string, imageDirectory: string, size:number, id: string){
  try{
    if(fileName){
      const path = `${this.commonPath}/${id}`
      try{
        // await imgResizing(imageDirectory,path, fileName, size)
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

async deleteAllImages(id) {
  const event = await this.findOne(id);
      if (!event) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'event does not exist'
        })
      }
      try {
        if (event.imgName) {
          await this.s3Service.deleteFile(event.imgName);
        }
        
        if (event.imgNameMobile) {
          await this.s3Service.deleteFile(event.imgNameMobile);
        }
        
        event.imgName = null;
        event.imgNameMobile = null;
  
        await this.update(id, event);
}catch(error){
  throw ErrorManager.createSignatureError(error.message);
}
}

async deleteImage(id:string, imgKey:string){
  const event = await this.findOne(id);
  if (!event) {
    throw new ErrorManager({
      type:'NOT_FOUND',
      message:'event does not exist'
    })
  }
try{
  if(event){
    await this.s3Service.deleteFile(imgKey);
    imgKey === event.imgName ? event.imgName = null : event.imgNameMobile = null;
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
