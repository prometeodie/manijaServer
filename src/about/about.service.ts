import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorManager } from 'src/utils/error.manager';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'node:fs';

import { CreateAboutDto } from './dto/create-about.dto';
import { imgResizing } from 'src/helpers/image.helper';
import { AboutSection } from './entities/about.entity';
import { UpdateAboutItemsOrderDto } from './dto/organize-item.dto';
import { UpdateAboutDto } from './dto/update-about.dto';


@Injectable()
export class AboutService {

  readonly commonPath: string = 'upload/ABOUT';
  
  constructor(
  @InjectModel(AboutSection.name)
  private aboutSectionModel: Model<AboutSection>){}

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

  
async deleteImage(imagePath: string): Promise<boolean> {
  try {
    const fs = require('fs').promises;
    
    await fs.rm(imagePath, { recursive: true });

    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`El archivo o directorio no existe: ${imagePath}`);
      return false;
    }

    console.error('Something wrong happened removing the file', error);
    throw error;
  }
}

  async resizeImg(fileName: string){
    try{
      if(fileName){
        const path = `${this.commonPath}`
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

deleteImgCatch(fileName: string){
  const imgPath = `${this.commonPath}/${fileName}`
    setTimeout(()=>{
      if (fs.existsSync(imgPath)) {
      this.deleteImage(imgPath)
        }
      },5000)
    }
}
  

