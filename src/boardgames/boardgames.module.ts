import { Module } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { BoardgamesController } from './boardgames.controller';

@Module({
  controllers: [BoardgamesController],
  providers: [BoardgamesService],
})
export class BoardgamesModule {}
