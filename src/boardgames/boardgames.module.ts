import { Module } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { BoardgamesController } from './boardgames.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Boardgame, BoardgameSchema } from './entities/boardgame.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [BoardgamesController],
  providers: [BoardgamesService],
  imports:[MongooseModule.forFeature([{
    name:Boardgame.name,
    schema: BoardgameSchema
  }]),
  AuthModule
]
})
export class BoardgamesModule {}
