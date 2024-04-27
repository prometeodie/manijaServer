import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import { imgResizing  } from 'src/helpers/image.helper';
import * as fs from 'node:fs';

import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { BlogsManija } from './entities/blogs-manija.entity';


@Injectable()
export class BlogsManijasService {

  readonly commonPath: string = 'upload/BLOGS';

  constructor(
    @InjectModel(BlogsManija.name) 
    private blogsManijaModel: Model<BlogsManija>,
  ) {}

  async create(createBlogsManijaDto: CreateBlogsManijaDto, files:Express.Multer.File[]) {
    try{
      const newBlog = await new this.blogsManijaModel( createBlogsManijaDto );
      newBlog.imgName = files.map(file => `${file.filename}`)
      newBlog.creationDate = new Date;
      return newBlog.save()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAll() {
    try{
      return await this.blogsManijaModel.find()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findOne(id: string) {
    try{
      const blog = await this.blogsManijaModel.findById(id)

      if ( !blog ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'Blog does not exist'
        })
      }
      return blog;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async update(id: string, updateBlog: UpdateBlogsManijaDto){
    try{

      const blog = await this.blogsManijaModel.findByIdAndUpdate(id, updateBlog, { new: true } );

      if (!blog) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'Blog does not exist'
        })
      }
      return blog;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async remove(id: string):Promise<void> {
    try{
      const blog = await this.blogsManijaModel.findByIdAndDelete(id)
      if ( !blog ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'Blog does not exist'
        })
      }
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
    
    resizeImg(blog:CreateBlogsManijaDto ,files: Express.Multer.File[]){
      try{
        if(files.length > 0){
          const path = `${this.commonPath}/${blog.itemName}`
          try{
            files.map((file,i) => imgResizing(path,file.filename,500))
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

  deleteImgCatch(files: Express.Multer.File[], updateBlogsManijaDto: UpdateBlogsManijaDto | CreateBlogsManijaDto){
    files.map((file)=>{
      const imgPath: string = `${this.commonPath}/${updateBlogsManijaDto.itemName}/${file.filename}`
      const optimizeImgPath: string = `${this.commonPath}/${updateBlogsManijaDto.itemName}/optimize/smallS-${file.filename}`
      setTimeout(()=>{
        if (fs.existsSync(imgPath)) {
        this.deleteImage(imgPath)
        this.deleteImage(optimizeImgPath)
      }
      },5000)
    })
  }
 }
