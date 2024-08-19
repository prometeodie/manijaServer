import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import { imgResizing  } from 'src/helpers/image.helper';
import * as fs from 'node:fs';

import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { BlogsManija } from './entities/blogs-manija.entity';
import { BlogsCategories } from './utils/blogs-categories.enum';


@Injectable()
export class BlogsManijasService {

  readonly commonPath: string = 'upload/BLOGS';

  constructor(
    @InjectModel(BlogsManija.name) 
    private blogsManijaModel: Model<BlogsManija>,
  ) {}

  async create(createBlogsManijaDto: CreateBlogsManijaDto) {
    try{
      const newBlog = await new this.blogsManijaModel( createBlogsManijaDto );
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

  public async findAllWithFilters( category: BlogsCategories, limit: number, offset: number) {

    try{
      let blogs = await this.blogsManijaModel.find()
      if (category) {
        blogs = blogs.filter(blog => blog.category.includes(category));
      }

      const paginatedBlogs = blogs.slice(offset, offset + limit);
      return paginatedBlogs;
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

  async findPublishedAboutSections(): Promise<BlogsManija[]>{
    try{
      return await this.blogsManijaModel.find({ publish: true }).exec();
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
 }
