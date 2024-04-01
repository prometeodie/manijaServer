import { Injectable } from '@nestjs/common';
import { CreateBlogsManijaDto } from './dto/create-blogs-manija.dto';
import { UpdateBlogsManijaDto } from './dto/update-blogs-manija.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsManija } from './entities/blogs-manija.entity';
import { ErrorManager } from 'src/utils/error.manager';
import { imgResizing } from 'src/helpers/image.helper';

@Injectable()
export class BlogsManijasService {


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
          message:'blog does not exist'
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
          message:'message does not exist'
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
          message:'blog does not exist'
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
          const path = `upload/blogs/${blog.itemName}`
          try{
            files.map((file,i) => imgResizing(`${path}`,path,file.filename,500))
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
}
