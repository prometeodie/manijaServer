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
      return await this.blogsManijaModel.findByIdAndUpdate(id, updateBlog, { new: true } );
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
        console.error('Something wrong happened removing "articles" folder', error)
        throw error;
      }
  }

  resizeImg(blog:CreateBlogsManijaDto ,files: Express.Multer.File[]){
    blog.imgName = files.map(file => `${file.filename}`)
      if(files.length > 0){
        const path = `upload/blogs/${blog.itemName}`
        files.map((file,i) => imgResizing(`${path}/${blog.imgName[i]}`,path,file.filename,300))
      }
  }
}
