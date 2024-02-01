import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardgameDto } from './create-boardgame.dto';

export class UpdateBoardgameDto extends PartialType(CreateBoardgameDto) {}
