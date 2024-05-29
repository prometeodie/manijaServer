import { Injectable} from '@nestjs/common';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Boardgame } from './entities/boardgame.entity';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import * as fs from 'node:fs';

import { imgResizing } from 'src/helpers/image.helper';
import { UploadImgDto } from './dto/upload-boardImg-manija.dto';
import { ManijometroPoolDto } from './dto/manijometro-pool.dto';
import { ManijometroPoolEntity } from './utils/manijometro-interfaces';



@Injectable()
export class BoardgamesService {
  
  readonly commonPath: string = 'upload/BOARDGAMES';

  constructor(
    @InjectModel(Boardgame.name) 
    private boardgameModel: Model<Boardgame>,
  ) {}

  async create(createBoardgameDto: CreateBoardgameDto) {
    try{
      const newBoardGame = await  new this.boardgameModel( createBoardgameDto );
    if((await this.findBoardgamesByTitle(newBoardGame.title)).length > 1){
      throw new ErrorManager({
        type:'CONFLICT',
        message:'boardgame alredy exist'
      })
    }
      newBoardGame.creationDate = new Date();
      await newBoardGame.save();
      return newBoardGame.id;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAll(): Promise<Boardgame[]> {
    try{
      return await this.boardgameModel.find()
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findPublishedBoardgames(): Promise<Boardgame[]>{
    try{
      return await this.boardgameModel.find({ publish: true }).exec();
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findBoardgamesByTitle(title: string): Promise<Boardgame[]> {
    try{
      return await this.boardgameModel.find({ title: { $regex: title, $options: 'i' } }).exec();
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getVotingValues(){
    try{
      const boardgames = await this.boardgameModel.find();

      return boardgames.map(({ id,title,manijometroPool,manijometro,cardCoverImgName }) =>{ return { id, title, manijometroPool, manijometro, cardCoverImgName} })
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findOne(id: string) {
    try{
      const boardgame = await this.boardgameModel.findById(id)
      
      if ( !boardgame ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'boardgame does not exist'
        })
      }
      return boardgame;
    }catch(error){
      console.error(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async update(id: string, updateBoardgameDto: UpdateBoardgameDto) {
    try{
      const boardgame = await this.boardgameModel.findByIdAndUpdate(id, updateBoardgameDto, { new: true } );
      if (!boardgame) {
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'boardgame does not exist'
        })
      }
      return boardgame;
    }catch(error){
    throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateManijometro(id:string, manijometroPoolDto:ManijometroPoolDto ){
    try{
      const boardgame = await this.boardgameModel.findById(id)
      const { userId, manijometroValuesPool, totalManijometroUserValue } = manijometroPoolDto; 

      const existingVote = boardgame.manijometroPool.find(userVote => userVote.userId === userId);

      if (existingVote) {
        existingVote.manijometroValuesPool = manijometroValuesPool;
        existingVote.totalManijometroUserValue = totalManijometroUserValue;
      } else {
        boardgame.manijometroPool.push(manijometroPoolDto);
      }
      
      boardgame.manijometro = this.manijometroTotalValue(boardgame.manijometroPool);

        const manijometroPool = await this.boardgameModel.findByIdAndUpdate( id, boardgame,{ new: true });
        if (!manijometroPool) {
          throw new ErrorManager({
            type:'NOT_FOUND',
            message:'boardgame does not exist'
          })
        }
        return manijometroPool;
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async remove(id: string) {

    try{
      const boardgame = await this.boardgameModel.findByIdAndDelete(id)
      if ( !boardgame ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'Boardgame does not exist'
        })
      }
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  AddManijometroPosition(boardgames: Boardgame[]){

    const boards = boardgames.sort((a, b)=> b.manijometro - a.manijometro).map((board,i)=>{
       board.manijometroPosition = i+1;
       return board;
    })
    return boards
  }

  resizeImg(itemName:string[], boardName:string){
    try{
      if(itemName.length > 0){
        const path = `${this.commonPath}/${boardName}`
        try{
          itemName.map((file) => imgResizing(path,file,500))
          return true;
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

deleteImgCatch(req:UploadImgDto, files: Express.Multer.File[]){
  files.map((file)=>{
    let imgPath: string;
    if(file.filename.includes('cardCover')){
      imgPath = `${this.commonPath}/${req.itemName}/cardCover/${file.filename}`
    }else{
      imgPath = `${this.commonPath}/${req.itemName}/${file.filename}`
    }
    setTimeout(()=>{
      if (fs.existsSync(imgPath)) {
      this.deleteImage(imgPath)
        }
      },5000)
    })
  }

  manijometroTotalValue(manijometroPools: ManijometroPoolEntity[]): number {

      if (manijometroPools.length === 0) {
        return 0; 
      }
    
      const totalSum = manijometroPools.reduce((sum, pool) => sum + pool.totalManijometroUserValue, 0);
      const average = totalSum / manijometroPools.length;
    
      return average;
    }

}
  

