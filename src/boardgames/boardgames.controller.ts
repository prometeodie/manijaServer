import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, Query, UploadedFiles, UseInterceptors, UseGuards } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { diskStorage } from 'multer';
import { UploadImgDto } from './dto/upload-boardImg-manija.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { PublicAccess } from 'src/decorators/public.decorator';
import { RolesAccess } from 'src/decorators/roles.decorator';
import { Roles } from 'src/utils/roles.enum';
import { ManijometroPoolDto } from './dto/manijometro-pool.dto';
import { CategoryGame } from './utils/boardgames-categories.enum';




@Controller('boardgames')
@UseGuards( AuthGuard, RolesGuard)
export class BoardgamesController {
  constructor(private readonly boardgamesService: BoardgamesService) {}

  @RolesAccess(Roles.ADMIN)
  @Post('upload')
  public async create(
    @Body() createBoardgameDto: CreateBoardgameDto,
    @Res() res: Response,
  ) {
    try{
      let boardgame = createBoardgameDto;
      const id = await this.boardgamesService.create(boardgame);
      return res.status(HttpStatus.OK).json({
        message:'Boardgame has been saved',
        id:id
      })
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error uploading Boardgame ${error.message}`
      });
    }
  }

  @RolesAccess(Roles.ADMIN,Roles.MASTER)
  @Post('uploadImg/:id')
  @UseInterceptors(FilesInterceptor('files', 4, {
    fileFilter: fileFilter,
    limits: {
      fileSize: 3145728
    },
    storage: diskStorage({
      destination: saveImage,
      filename: nameImg
    })
  }))
  public async uploadImg(
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadImgDto: UploadImgDto,
    @Param('id') id: string, 
  ){
    try{
      const boardgame = await this.boardgamesService.findOne(id);
      const imgNames = files.map(file => {return file.filename;})
      this.boardgamesService.resizeImg(imgNames, boardgame.title)
      imgNames.map(img =>{
        (img.includes('cardCover'))? boardgame.cardCoverImgName = img : boardgame.imgName.push(img);
      });
      const {_id, ...newBoard} = boardgame.toJSON();
      const updatedBoard = {
        ...newBoard,
        itemName: uploadImgDto.itemName
      };
      this.boardgamesService.update(id,updatedBoard)
      return res.status(HttpStatus.OK).json({
        message:'img has been saved',
      })
    }catch(error){
      this.boardgamesService.deleteImgCatch(uploadImgDto, files)
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
      const boardgames = await this.boardgamesService.findAllWithFilters(category, limit, offset);

      return res.status(HttpStatus.OK).json(boardgames);
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
    @Res() res: Response
  ) {
    try {
      const boardgames = this.boardgamesService.AddManijometroPosition(await this.boardgamesService.findPublishedBoardgames());
      return res.status(HttpStatus.OK).json(boardgames);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
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

  @PublicAccess()
  @Get('findboardgame')
  public async getBoardgamesByTitle(@Query('title') title: string) {
    return this.boardgamesService.findBoardgamesByTitle(title);
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

  @RolesAccess(Roles.ADMIN)
  @Delete('delete/img/:path(*)')
  public async removeImg(@Param('path') path: string) {
    try {
      await this.boardgamesService.deleteImage(path);
      return { success: true, message: 'Image deleted successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to delete image.', error: error.message };
    }
  }

}
