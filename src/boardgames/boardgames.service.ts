import { Injectable } from '@nestjs/common';
import { CreateBoardgameDto } from './dto/create-boardgame.dto';
import { UpdateBoardgameDto } from './dto/update-boardgame.dto';

@Injectable()
export class BoardgamesService {
  create(createBoardgameDto: CreateBoardgameDto) {
    return 'This action adds a new boardgame';
  }

  findAll() {
    return `This action returns all boardgames`;
  }

  findOne(id: number) {
    return `This action returns a #${id} boardgame`;
  }

  update(id: number, updateBoardgameDto: UpdateBoardgameDto) {
    return `This action updates a #${id} boardgame`;
  }

  remove(id: number) {
    return `This action removes a #${id} boardgame`;
  }
}
