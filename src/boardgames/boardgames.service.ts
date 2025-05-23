import { Injectable} from '@nestjs/common';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Boardgame } from './entities/boardgame.entity';
import { Model, Types } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import * as fs from 'node:fs';

import { extractFileName, imgResizing } from 'src/helpers/image.helper';
import { ManijometroPoolDto } from './dto/manijometro-pool.dto';
import { ManijometroPoolEntity } from './utils/manijometro-interfaces';
import { CategoryGame } from './utils/boardgames-categories.enum';
import { UpdateRouletteDto } from './dto/update-roulette.dto';
import { CommunityRatingDto } from './dto/comunity-rating.dto';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/utils/s3/s3.service';




@Injectable()
export class BoardgamesService {
  
  readonly commonPath: string = 'upload/BOARDGAMES';

  constructor(
    @InjectModel(Boardgame.name) 
    private boardgameModel: Model<Boardgame>,
    private readonly s3Service: S3Service
  ) {}

  async create(createBoardgameDto: CreateBoardgameDto) {
    try{
      const newBoardGame = await  new this.boardgameModel( createBoardgameDto );
    if((await this.findBoardgamesByTitle(newBoardGame.title, false)).length !== 0){
      throw new ErrorManager({
        type:'CONFLICT',
        message:'boardgame alredy exist'
      })
    }
      newBoardGame.creationDate = new Date();
      (newBoardGame.publish)?
      newBoardGame.roulette = true: 
      newBoardGame.roulette = false; 
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

  public async findAllWithFilters( category: CategoryGame, limit: number, offset: number, publicData:boolean): Promise<Boardgame[]> {

    try{
      let boards = [];await this.boardgameModel.find();
      if(publicData){
        boards = await this.findPublishedBoardgames();
      }else{
        boards = await this.boardgameModel.find().exec();
      }
      let boardgames = this.AddManijometroPosition(boards);
      if (category && Object.values(CategoryGame).includes(category)) {
        boardgames = boardgames.filter(board => board.categoryGame.includes(category));
      }
      const paginatedBoards = boardgames.slice(offset, offset + limit);
      return paginatedBoards;
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

  async findAllForRoulette(){
    try{
      return await this.boardgameModel.find({ roulette: true }).exec();
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findBoardgamesByTitle(title: string, publicData:boolean): Promise<Boardgame[]> {
    try{
      let boards = [];
      if(publicData){
        boards = await this.findPublishedBoardgames();
      }else{
        boards = await this.boardgameModel.find().exec();
      }
      return this.AddManijometroPosition(boards).filter(board => board.title.toLocaleLowerCase().includes(title.toLocaleLowerCase()));
    }catch(error){
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findUserVote( id:string, voteId:string){
    const boardgame = await this.findOne(id);
    const filteredVote = boardgame.communityRating.find(vote => vote.voteId === voteId);
    return filteredVote.userScore;
  }

  async getVotingValues(){
    try{
      const boardgames = await this.boardgameModel.find();
      const boardgamesPosition = this.AddManijometroPosition(boardgames);
      return boardgamesPosition.map(({ _id,title,manijometroPool,manijometroPosition,cardCoverImgName }) =>{ return { _id, title, manijometroPool, manijometroPosition, cardCoverImgName} })
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
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async update(id: string, updateBoardgameDto: UpdateBoardgameDto) {
    try{
      const boardgame = await this.boardgameModel.findByIdAndUpdate(id, updateBoardgameDto, { new: true } );
      if(!boardgame.publish){
         await this.boardgameModel.findByIdAndUpdate(id,{roulette:false}, { new: true } )
      }
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

  async updateRoulette(updateRoulette: UpdateRouletteDto){
    const {_id, roulette} = updateRoulette;
    try{
      const boardgame = await this.boardgameModel.findByIdAndUpdate(_id, {roulette}, { new: true } );
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

  async communityRating(communityRatingDto: CommunityRatingDto, _id: string) {
    try {
      const { voteId, userScore } = communityRatingDto;
      const boardgame = await this.findOne(_id);
      const newVoteId = uuidv4();
  
      if (!boardgame.communityRating) {
        boardgame.communityRating = [];
      }
  
      const existingVoteIndex = boardgame.communityRating.findIndex(vote => vote.voteId === voteId);
      
      if (existingVoteIndex !== -1) {
        boardgame.communityRating[existingVoteIndex].userScore = userScore;
      } else {
        boardgame.communityRating.push({ voteId: newVoteId, userScore });
      }
  
      boardgame.communityScore = boardgame.communityRating.reduce((acc, vote) => acc + vote.userScore, 0) / boardgame.communityRating.length;
      await this.boardgameModel.findByIdAndUpdate(_id, {
        communityRating: boardgame.communityRating,
        communityScore: Math.ceil(boardgame.communityScore)
      }, { new: true });
  
      return newVoteId;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateManijometro(id:string, manijometroPoolDto:ManijometroPoolDto ){
    try{
      if (!Types.ObjectId.isValid(id)) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Invalid ID format',
        });
      }

      const boardgame = await this.findOne(id);
      const { userId, manijometroValuesPool, totalManijometroUserValue } = manijometroPoolDto; 
      if(!boardgame.manijometroPool) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Something goes wrong',
        });
      }
        const existingVote = boardgame.manijometroPool.find(userVote => userVote.userId === userId);
        if (existingVote) {
          existingVote.manijometroValuesPool = manijometroValuesPool;
          existingVote.totalManijometroUserValue = totalManijometroUserValue;
        }
       else {
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
      this.deleteAllImages(id);
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

async getCharacterAverage(){
  try{
    const boardgames = await this.boardgameModel.find();
    const characterAverage = boardgames.reduce((acc, boardgame) => acc + boardgame.gameReview.length, 0) / boardgames.length;
    return Math.ceil(characterAverage);
  }catch(error){
    console.error('Something wrong happened', error)
    throw error;    
  }
}

async deleteAllImages(id: string) {
  try {
    const boardgame = await this.findOne(id);
    if (!boardgame) {
      throw new ErrorManager({
        type: 'NOT_FOUND',
        message: 'event does not exist'
      });
    }
    const imagesToDelete = [
      ...boardgame.imgName,
      ...boardgame.imgNameMobile,
      boardgame.cardCoverImgName,
      boardgame.cardCoverImgNameMobile
    ].filter(Boolean);
    await Promise.all(imagesToDelete.map(img => this.s3Service.deleteFile(img)));

    boardgame.imgName = [];
    boardgame.imgNameMobile = [];
    boardgame.cardCoverImgName = null;
    boardgame.cardCoverImgNameMobile = null;

  } catch (error) {
    throw ErrorManager.createSignatureError(error.message);
  }
}

async deleteImage(id: string, imgKey: string) {
  const boardgame = await this.findOne(id);
  if (!boardgame) {
    throw new ErrorManager({
      type: 'NOT_FOUND',
      message: 'Board Game does not exist'
    });
  }
  try {
    const cleanImgName = extractFileName(imgKey);
    const regularImgKey = boardgame.imgName.find(img => img.includes(cleanImgName));
    const mobileImgKey = boardgame.imgNameMobile.find(img => img.includes(cleanImgName));
    if (boardgame.imgName.includes(imgKey)) {
      boardgame.imgName = boardgame.imgName.filter(img => img !== imgKey);
    }
    if (mobileImgKey && boardgame.imgNameMobile.includes(mobileImgKey)) {
      await Promise.all([
        await this.s3Service.deleteFile(regularImgKey),
        await this.s3Service.deleteFile(mobileImgKey)
      ]);
    }
      boardgame.imgName = boardgame.imgName.filter(img => img !== imgKey);
      boardgame.imgNameMobile = boardgame.imgNameMobile.filter(img => img !== mobileImgKey);
      await this.update(id, boardgame);
    }catch (error) {
    throw ErrorManager.createSignatureError(error.message);
  }
}

async deleteCardCoverImage(id:string, imgKey:string){
  const boardgame = await this.findOne(id);
  if (!boardgame) {
    throw new ErrorManager({
      type:'NOT_FOUND',
      message:'event does not exist'
    })
  }
try{
  if(boardgame){

    await this.s3Service.deleteFile(imgKey);

    if (boardgame.cardCoverImgName === imgKey) {
      boardgame.cardCoverImgName = null;
    } else if (boardgame.cardCoverImgNameMobile === imgKey) {
      boardgame.cardCoverImgNameMobile = null;
    }
    await this.update(id, boardgame);
  }
}catch(error){
  throw ErrorManager.createSignatureError(error.message);
  } 
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
  

