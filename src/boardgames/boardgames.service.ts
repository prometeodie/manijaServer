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

  findOne(id: string) {
    return `This action returns a #${id} boardgame`;
  }

  update(id: string, updateBoardgameDto: UpdateBoardgameDto) {
    return `This action updates a #${id} boardgame`;
  }

  remove(id: string) {
    return `This action removes a #${id} boardgame`;
  }
}
