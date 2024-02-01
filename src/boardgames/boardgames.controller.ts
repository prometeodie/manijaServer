import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';

@Controller('boardgames')
export class BoardgamesController {
  constructor(private readonly boardgamesService: BoardgamesService) {}

  @Post()
  create(@Body() createBoardgameDto: CreateBoardgameDto) {
    return this.boardgamesService.create(createBoardgameDto);
  }

  @Get()
  findAll() {
    return this.boardgamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardgamesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardgameDto: UpdateBoardgameDto) {
    return this.boardgamesService.update(+id, updateBoardgameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardgamesService.remove(+id);
  }
}
