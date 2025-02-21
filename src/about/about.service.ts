import { Injectable } from '@nestjs/common';
import { ErrorManager } from 'src/utils/error.manager';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateAboutDto } from './dto/create-about.dto';
import { AboutSection } from './entities/about.entity';
import { UpdateAboutItemsOrderDto } from './dto/organize-item.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { S3Service } from 'src/utils/s3/s3.service';


@Injectable()
export class AboutService {

  readonly commonPath: string = 'upload/ABOUT';
  
  constructor(
  @InjectModel(AboutSection.name)
  private readonly aboutSectionModel: Model<AboutSection>, private readonly s3Service: S3Service){}

  async create(createAboutDto: CreateAboutDto) {
    try{  
      const newAboutSection = await new this.aboutSectionModel( createAboutDto );
      const amountOfitems = (await this.findAll()).length;
      newAboutSection.creationDate = new Date;
      newAboutSection.position = amountOfitems + 1;
      await newAboutSection.save()
      return newAboutSection.id;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAll() {
    try{
      return await this.aboutSectionModel.find()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findOne(id: string) {
    try{

      const aboutSection = await this.aboutSectionModel.findById(id)

      if ( !aboutSection){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'about section does not exist'
        })
      }
      return aboutSection;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getCharacterAverage(){
    try{
      const aboutItems = await this.aboutSectionModel.find();
      const characterAverage = aboutItems.reduce((acc, aboutItem) => acc + aboutItem.text.length, 0) / aboutItems.length;
      return Math.ceil(characterAverage);
    }catch(error){
      console.error('Something wrong happened', error)
      throw error;    
    }
  }

  async findPublishedAboutSections(): Promise<AboutSection[]>{
    try{
      return await this.aboutSectionModel.find({ publish: true }).exec();
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async update(id: string, updateAboutDto: UpdateAboutDto) {
    try{
      const aboutSection = await this.aboutSectionModel.findByIdAndUpdate(id, updateAboutDto, { new: true } );
      if (!aboutSection) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'About Section does not exist'
        })
      }
      return aboutSection;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateOrder(orderedIds: UpdateAboutItemsOrderDto[]){
    try{
      for (let i = 0; i < orderedIds.length; i++) {
        const aboutSectionItems = await this.aboutSectionModel.findByIdAndUpdate(orderedIds[i], { position: i });
      if (!aboutSectionItems) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'About Section does not exist'
        })
      }
    }
    return { message: 'Order updated successfully' };
  }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  
  sortItemsByPosition(items: AboutSection[] ){
    return items.sort((a, b) => a.position - b.position);
  }

  async remove(id: string) {
    try{
      const aboutSection = await this.aboutSectionModel.findByIdAndDelete(id)
      if ( !aboutSection ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'About Section does not exist'
        })}
      return aboutSection;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

async deleteAllImages(id) {
  const aboutItem = await this.findOne(id);
      if (!aboutItem) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'About item does not exist'
        })
      }
      try {
        if (aboutItem.imgName) {
          await this.s3Service.deleteFile(aboutItem.imgName);
        }
        
        if (aboutItem.imgNameMobile) {
          await this.s3Service.deleteFile(aboutItem.imgNameMobile);
        }
        
        aboutItem.imgName = null;
        aboutItem.imgNameMobile = null;
  
        await this.update(id, aboutItem);
}catch(error){
  throw ErrorManager.createSignatureError(error.message);
}
}

async deleteImage(id:string, imgKey:string){
  const aboutItem = await this.findOne(id);
  if (!aboutItem) {
    throw new ErrorManager({
      type:'NOT_FOUND',
      message:'About item does not exist'
    })
  }
try{
  if(aboutItem){
    await this.s3Service.deleteFile(imgKey);
    imgKey === aboutItem.imgName ? aboutItem.imgName = null : aboutItem.imgNameMobile = null;
    await this.update(id, aboutItem);
  }
}catch(error){
  throw ErrorManager.createSignatureError(error.message);
  } 
}
}
  

