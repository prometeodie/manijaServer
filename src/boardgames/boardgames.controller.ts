import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter, nameImg, saveImage } from 'src/helpers/image.helper';
import { diskStorage } from 'multer';
import { UploadImgDto } from 'src/blogs-manijas/dto/upload-img-manija.dto';


@Controller('boardgames')
export class BoardgamesController {
  constructor(private readonly boardgamesService: BoardgamesService) {}
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
        message: `Error uploading the Blog ${error.message}`
      });
    }
  }

 
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
      // TODO:poner que en trello que para guardar la img card cover a la hora de suvir la img tiene que contener en su nombre la palabra "cardCover"
      // TODO:hacer que se guarde el nombre de img cardcover en la propiedad cardcover del objeto en la BD
      const boardgame = await this.boardgamesService.findOne(id);
      const imgNames = files.map(file => {return file.filename;})
      this.boardgamesService.resizeImg(imgNames, boardgame.title)
      imgNames.map(img=>boardgame.imgName.push(img));
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
  public async findAll(
    @Res() res: Response
  ) {
    try {
      const boardgames = this.boardgamesService.AddManijometroPosition(await this.boardgamesService.findAll()) ;
      return res.status(HttpStatus.OK).json(boardgames);
    } catch (error) {
      console.error('Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `There was an error processing the request ${error.message}`,
      });
    }
  }

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

  @Get('findboardgame')
  public async getBoardgamesByTitle(@Query('title') title: string) {
    return this.boardgamesService.findBoardgamesByTitle(title);
  }

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
        message: `Error finding the Blog ${error.message}`
      });
    }
  }

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
        message:`Failed to updated the blog ${error.message}`
      })
    }
  }

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
        message:`Failed to delete Blog`
      })
    }
  }

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

// TODO:redisenar multer para poder guardar la img de portada y poder solucionar el problema de que si falla a la hora de crear el objeto guarda igual las imagenes
