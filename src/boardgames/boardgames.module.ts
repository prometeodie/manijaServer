import { Module } from '@nestjs/common';
import { BoardgamesService } from './boardgames.service';
import { BoardgamesController } from './boardgames.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Boardgame, BoardgameSchema } from './entities/boardgame.entity';
import { AuthModule } from 'src/auth/auth.module';
import { S3Service } from 'src/utils/s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [BoardgamesController],
  providers: [BoardgamesService, S3Service],
  imports:[
      ConfigModule,
      MongooseModule.forFeature([{
    name:Boardgame.name,
    schema: BoardgameSchema
  }]),
  AuthModule
]
})
export class BoardgamesModule {}
