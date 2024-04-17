import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, Query } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';
import { Response } from 'express';


@Controller('boardgames')
export class BoardgamesController {
  constructor(private readonly boardgamesService: BoardgamesService) {}

  @Post('upload')
  public async create(
    @Body() createBoardgameDto: CreateBoardgameDto,
    @Res() res: Response
  ) {
    try{
      const boardgame = createBoardgameDto;
      await this.boardgamesService.create(boardgame);
      return res.status(HttpStatus.OK).json({
        message:'Boardgame has been saved',
      })
    }catch(error){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error uploading the Blog ${error.message}`
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
      const boardgame = await this.boardgamesService.findOne(id);
      const position = boardgames.findIndex(boardgamePosition => boardgamePosition.title === boardgame.title );
      boardgame.manijometroPosition = position +1;
      return res.status(HttpStatus.OK).json(boardgame);
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

}


// TODO:aplicar la ordenada del manijometro para ver la posicion en base si esta publish en true, hacer un backup para asegurar que se guarde antes de insertar un nuevo elemento y borrar la BD vieja
// TODO:redisenar multer para poder guardar la img de portada y poder solucionar el problema de que si falla a la hora de crear el objeto guarda igual las imagenes
