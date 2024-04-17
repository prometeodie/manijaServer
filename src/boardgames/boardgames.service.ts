import { Injectable } from '@nestjs/common';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Boardgame } from './entities/boardgame.entity';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class BoardgamesService {

  constructor(
    @InjectModel(Boardgame.name) 
    private boardgameModel: Model<Boardgame>,
  ) {}

  async create(createBoardgameDto: CreateBoardgameDto) {
    try{
      const newBoardGame = await  new this.boardgameModel( createBoardgameDto );
      newBoardGame.creationDate = new Date();
      newBoardGame.manijometroPosition = 1;
      return await newBoardGame.save();
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

}
