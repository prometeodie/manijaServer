import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contact } from './entities/contact.entity';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class ContactService {

  constructor(
    @InjectModel(Contact.name)
    private manijaContacModel: Model<Contact>){}

  async create(createContactDto: CreateContactDto) {
    
    try{
      const newMenssage = await new this.manijaContacModel( createContactDto );
      newMenssage.creationDate = new Date;
      newMenssage.hasBeenReaded = false;
      return newMenssage.save()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAll() {
    try{
      return await this.manijaContacModel.find()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findOne(id: string) {
    try{

      const event = await this.manijaContacModel.findById(id)
      
      if ( !event ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'message does not exist'
        })
      }
      return event;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    try{
      const message = await this.manijaContacModel.findByIdAndUpdate(id, updateContactDto, { new: true } );
      if (!message) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'message does not exist'
        })
      }
      return message;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async remove(id: string) {
    try{
      const message = await this.manijaContacModel.findByIdAndDelete(id)
      if ( !message ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'message does not exist'
        })
      }
      return message;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
