import { PublicAccess } from './../decorators/public.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, Query, UploadedFiles, UseInterceptors, UseGuards, UploadedFile } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';
import { Response } from 'express';
import { fileFilter, imgResizing } from 'src/helpers/image.helper';
import * as multer from 'multer';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { ManijometroPoolDto } from './dto/manijometro-pool.dto';
import { CategoryGame } from './utils/boardgames-categories.enum';
import { ErrorManager } from 'src/utils/error.manager';
import { UpdateRouletteDto } from './dto/update-roulette.dto';
import { CommunityRatingDto } from './dto/comunity-rating.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/utils/s3/s3.service';
import { DeleteBoardGameImgKeyDto } from './dto/delete-boardImg-manija.dto';





@Controller('boardgames')
@UseGuards( AuthGuard, RolesGuard)
export class BoardgamesController {
  constructor(private readonly boardgamesService: BoardgamesService, private readonly s3Service:S3Service) {}

  @RolesAccess(Roles.ADMIN)
  @Post('upload')
  public async create(
    @Body() createBoardgameDto: CreateBoardgameDto,
    @Res() res: Response,
  ) {
    try {
      const existingBoardgames = await this.boardgamesService.findBoardgamesByTitle(
        createBoardgameDto.title,
        false,
      );
  
      if (existingBoardgames.length !== 0) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'Boardgame already exists',
          type: 'RESOURCE_ALREADY_EXISTS',
        });           
      }
  
      const boardgameId = await this.boardgamesService.create(createBoardgameDto);
  
      return res.status(HttpStatus.OK).json({
        message: 'Boardgame has been saved',
        _id: boardgameId,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error uploading Boardgame: ${error.message}`,
      });
    }
  }
  
        @Post('upload-images/:id')
        @UseInterceptors(FilesInterceptor('files', 4, { 
          fileFilter: fileFilter,
          limits: {
            fileSize: 3145728, // files max weight 3MB 
          },
          storage: multer.memoryStorage(),
        }))
        @RolesAccess(Roles.ADMIN)
        public async uploadImgs(
          @Res() res: Response,
          @UploadedFiles() files: Express.Multer.File[], 
          @Param('id') id: string
        ) {
          try{
            const boardgame = await this.boardgamesService.findOne(id);

            const uploadResults = await Promise.all(
              files.map(async (file) => {
                const originalName = file.originalname.replace(/\s+/g, '_');
            
                const [img800, img600] = await Promise.all([
                  imgResizing(file, 800),
                  imgResizing(file, 600),
                ]);
            
                const [key, keyMobile] = await Promise.all([
                  this.s3Service.uploadFile(img800, originalName),
                  this.s3Service.uploadFile(img600, `mobile-${originalName}`),
                ]);
            
                return { key, keyMobile };
              })
            );
              uploadResults.forEach(keys =>{
                boardgame.imgName.push(keys.key);
                boardgame.imgNameMobile.push(keys.keyMobile);
              })
           await this.boardgamesService.update(id, boardgame);

            return res.status(HttpStatus.OK).json({
              message:'img has been saved',
              })
          }catch(error){
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              message: `There was an error processing the request ${error.message}`,
            });
          }
        }

        @Post('upload-cardcover-image/:id')
              @UseInterceptors(FileInterceptor('file', {
                fileFilter: fileFilter,
                limits: {
                  fileSize: 3145728
                },
                storage: multer.memoryStorage(),
              }))
              // @RolesAccess(Roles.ADMIN)
              @PublicAccess()
              public async uploadImg(
                @Res() res: Response,
                @UploadedFile() file: Express.Multer.File,
                @Param('id') id: string, 
              ){
                try{
                  const boardgame = await this.boardgamesService.findOne(id);
                  const originalName = file.originalname.replace(/\s+/g, '_');
            
                  const [img800, img600] = await Promise.all([
                    imgResizing(file, 800),
                    imgResizing(file, 600),
                  ]);
                
                  const [key, keyMobile] = await Promise.all([
                    this.s3Service.uploadFile(img800, originalName),
                    this.s3Service.uploadFile(img600, `mobile-${originalName}`),
                  ]);
        
                  boardgame.cardCoverImgName = key;
                  boardgame.cardCoverImgNameMobile = keyMobile;
                  await this.boardgamesService.update(id, boardgame);
                  return res.status(HttpStatus.OK).json({
                    message:'img has been saved',
                    })
                }catch(error){
        
                  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: `There was an error processing the request ${error.message}`,
                  });
                }
              }


  @Get('admin')
  @RolesAccess(Roles.ADMIN)
  public async findAll(
    @Query('category') category: CategoryGame,
    @Query('page') page: number = 1, 
    @Res() res: Response
  ) {
    try {
      const limit = 10; 
      const offset = (page - 1) * limit;
      const boardgames = await this.boardgamesService.findAllWithFilters(category, limit, offset, false);
      return res.status(HttpStatus.OK).json(boardgames);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request: ${error.message}`,
      });
    }
  }

  @Get('character-average')
  @RolesAccess(Roles.ADMIN)
  public async getCharacterAverage(
    @Res() res: Response
  ) {
    try {
      const charactersAverage = await this.boardgamesService.getCharacterAverage();
      return res.status(HttpStatus.OK).json({charactersAverage: charactersAverage});
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request: ${error.message}`,
      });
    }
  }

  @PublicAccess()
  @Get()
  public async findAllAvailableToPublish(
    @Query('category') category: CategoryGame,
    @Query('page') page: number = 1, 
    @Res() res: Response
  ) {
    try {
      const limit = 10; 
      const offset = (page - 1) * limit;
      const boardgames = await this.boardgamesService.findAllWithFilters(category, limit, offset, true);
      return res.status(HttpStatus.OK).json(boardgames);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request: ${error.message}`,
      });
    }
  }

  @PublicAccess()
  @Get('roulette')
  public async findAllAvailableToroulette(
    @Res() res: Response
  ) {
    try {
      const boardgames = await this.boardgamesService.findAllForRoulette();
      return res.status(HttpStatus.OK).json(boardgames);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request: ${error.message}`,
      });
    }
  }

  @RolesAccess(Roles.ADMIN)
  @Get('admin-manijometro')
  public async manijometroVotingGames(
    @Res() res: Response
  ) {
    try {
      const cleanBoardgames = await this.boardgamesService.getVotingValues()
      return res.status(HttpStatus.OK).json(cleanBoardgames);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

  @RolesAccess(Roles.ADMIN)
  @Get('game-manijometro/:id')
  public async manijometroGame(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const cleanBoardgames = await this.boardgamesService.getVotingValues()
      const boardgame = cleanBoardgames.filter(boardgame => {return boardgame._id.toString() === id})[0]
      if ( !boardgame ){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message:'boardgame does not exist'
        })
      }
      return res.status(HttpStatus.OK).json(boardgame);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

  @PublicAccess()
  @Get('findboardgame')
  public async getBoardgamesByTitle(@Query('title') title: string) {
    return this.boardgamesService.findBoardgamesByTitle(title,true);
  }

  @RolesAccess(Roles.ADMIN)
  @Get('findboardgame/admin')
  public async getBoardgamesByTitleAdmin(@Query('title') title: string) {
    return this.boardgamesService.findBoardgamesByTitle(title,false);
  }

  @PublicAccess()
  @Get(':id')
  public async findOne(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try{
      const boardgames = await this.boardgamesService.AddManijometroPosition(await this.boardgamesService.findPublishedBoardgames());
      const boardgameById = await this.boardgamesService.findOne(id);
      const position = boardgames.findIndex(boardgame=> boardgame.title === boardgameById.title );
      boardgameById.manijometroPosition = position +1;
      return res.status(HttpStatus.OK).json(boardgameById);
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error finding the Boardgame ${error.message}`
      });
    }
  }

  @PublicAccess()
  @Get('comunity-rating-uservote/:id')
  public async comunityRatingVote(
    @Param('id') id: string, 
    @Body() voteId: {voteId: string},
    @Res() res:Response
  ) {
    try{
      const VoteIdValue = voteId.voteId;
      const voteResponse = await this.boardgamesService.findUserVote( id, VoteIdValue );
      return res.status(HttpStatus.OK).json({
        message:'user vote',
        voteId: voteResponse
        })
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to vote ${error.message}`
      })
    }
  }

  @RolesAccess(Roles.ADMIN)
  @Patch('edit/:id')
  public async update(
    @Param('id') id: string, 
    @Body() updateBoardgameDto: UpdateBoardgameDto,
    @Res() res:Response
  ) {
    try{
      await this.boardgamesService.update(id, updateBoardgameDto);
      return res.status(HttpStatus.OK).json({
        message:'Boardgame has been actualized'
        })
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to updated Boardgame ${error.message}`
      })
    }
  }

  @RolesAccess(Roles.ADMIN)
  @Patch('togglee-roulette')
  public async updateRoulette(
    @Body() updateRoulette: UpdateRouletteDto,
    @Res() res:Response
  ) {
    try{
      await this.boardgamesService.updateRoulette(updateRoulette);
      return res.status(HttpStatus.OK).json({
        message:'Roulette has been actualized'
        })
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to updated Roulette ${error.message}`
      })
    }
  }

  @PublicAccess()
  @Patch('comunity-rating/:id')
  public async comunityRating(
    @Param('id') id: string, 
    @Body() communityRatingDto: CommunityRatingDto,
    @Res() res:Response
  ) {
    try{
      const voteResponse = await this.boardgamesService.communityRating(communityRatingDto,id);
      return res.status(HttpStatus.OK).json({
        message:'vote saved',
        voteId: voteResponse
        })
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to vote ${error.message}`
      })
    }
  }

  @RolesAccess(Roles.ADMIN)
  @Patch('manijometro/:id')
  public async updateManijometro(
    @Param('id') id: string, 
    @Body() manijometroPoolDto: ManijometroPoolDto,
    @Res() res:Response
  ) {
    try{
      await this.boardgamesService.updateManijometro(id, manijometroPoolDto );
      return res.status(HttpStatus.OK).json({
        message:'Manijometro has been actualized'
        })
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to updated Manijometro ${error.message}`
      })
    }
  }

  @RolesAccess(Roles.ADMIN)
  @Delete('delete/:id')
  public async remove(
    @Param('id') id: string,
    @Res() res:Response
  ) {
    try{
      await this.boardgamesService.remove(id);
      return res.status(HttpStatus.OK).json({
        message:'Boardgame has been deleted'
      })
    }catch(error){
      return res.status(HttpStatus.CONFLICT).json({
        message:`Failed to delete Boardgame`
      })
    }
  }

   @Delete('delete-all-images/:id')
   @RolesAccess(Roles.ADMIN)
       async deleteAllImages(@Param('id') id: string, @Res() res: Response) {
         try{
           await this.boardgamesService.deleteAllImages(id);
           return res.status(HttpStatus.OK).json({
             message: 'Images deleted successfully',
           });
         } catch (error) {
           return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
             message: 'Error deleting images',
           });
         }
       }
       
       @Delete('delete-image/:id')
       @RolesAccess(Roles.ADMIN)
       async deleteImage(
         @Param('id') id: string,
         @Body() imgKey: DeleteBoardGameImgKeyDto, 
         @Res() res: Response) {
         try{
           await this.boardgamesService.deleteImage(id,imgKey.key);
           return res.status(HttpStatus.OK).json({
             message: 'Image deleted successfully',
           });
         } catch (error) {
           return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
             message: 'Error deleting images',
           });
         }
       }

       @Delete('delete-cardcover-image/:id')
      @PublicAccess()
       async deleteCardCoverImage(
         @Param('id') id: string,
         @Body() imgKey: DeleteBoardGameImgKeyDto, 
         @Res() res: Response) {
         try{
           await this.boardgamesService.deleteCardCoverImage(id,imgKey.key);
           return res.status(HttpStatus.OK).json({
             message: 'Image deleted successfully',
           });
         } catch (error) {
           return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
             message: 'Error deleting images',
           });
         }
       }
}
