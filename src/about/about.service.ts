import { Injectable } from '@nestjs/common';
import { ErrorManager } from 'src/utils/error.manager';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'node:fs';

import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { imgResizing } from 'src/helpers/image.helper';
import { AboutSection } from './entities/about.entity';


@Injectable()
export class AboutService {

  readonly commonPath: string = 'upload/ABOUT';
  
  constructor(
  @InjectModel(AboutSection.name)
  private aboutSectionModel: Model<AboutSection>){}

  async create(createAboutDto: CreateAboutDto, file:Express.Multer.File) {
    try{
      const newAboutSection = await new this.aboutSectionModel( createAboutDto );
      newAboutSection.creationDate = new Date;
      newAboutSection.imgName = file.filename;
      newAboutSection.publish = false;
      return newAboutSection.save()
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

  deleteImage = async (imagePath: string) => {
    try{
      const fs = require('fs').promises
      await fs.rm(imagePath, { recursive: true })
    return true;
  } catch (error){
    console.error('Something wrong happened removing the file', error)
    throw error;
    }
  }

  resizeImg(itemName:string ,file: Express.Multer.File){
    try{
      if(file){
        console.log('entro en el resize')
        const path = `${this.commonPath}/${itemName}`
       try{
         imgResizing(path,file.filename,300);
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


  deleteImgCatch(file: Express.Multer.File, updateBlogsManijaDto: UpdateAboutDto | CreateAboutDto){
    
      const imgPath: string = `${this.commonPath}/${updateBlogsManijaDto.itemName}/${file.filename}`
      const optimizeImgPath: string = `${this.commonPath}/${updateBlogsManijaDto.itemName}/optimize/smallS-${file.filename}`
        setTimeout(()=>{
          if (fs.existsSync(imgPath)) {
          this.deleteImage(imgPath)
          this.deleteImage(optimizeImgPath)
        }
        },5000)
    }
  }

