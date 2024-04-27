import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsBoolean } from 'class-validator';

import { Section } from "src/helpers/section.enum";
import { CategoryGame } from "../utils/game.enum";
import { Dificulty } from "../utils/dificulty.enum";
import { Replayability } from "../utils/Replayability.enum";

import { StringToNumberTransformer } from "../utils/tranformToNumber";
import { Transform } from "class-transformer"; 
import { Reel } from '../utils/reel.class';



export class CreateBoardgameDto {
    
    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsOptional()
    @IsEnum(['EUROGAME','AMERITRASHGAME','PARTYGAME','FILLER'],{ 
        message:'Valid category Requiered'
    })
    categoryGame: CategoryGame;

    @IsArray()
    @IsOptional()
    categoryChips: string[];

    @IsNumber()
    @IsOptional()
    @Transform(value => new StringToNumberTransformer().to(value))
    minPlayers: number;

    @IsNumber()
    @IsOptional()
    @Transform(value => new StringToNumberTransformer().to(value))
    maxPlayers: number;

    @IsNumber()
    @IsOptional()
    @Transform(value => new StringToNumberTransformer().to(value))
    duration: number;

    @IsNumber()
    @IsOptional()
    @Transform(value => new StringToNumberTransformer().to(value))
    manijometro: number;

    @IsString()
    @IsOptional()
    gameReview: string;

    @IsString()
    @IsOptional()
    @IsEnum([Dificulty.LOW, Dificulty.MEDIUM, Dificulty.HIGH],{
        message:'Valid dificulty value Requiered'
    })
    dificulty: Dificulty;

    @IsString()
    @IsOptional()
    @IsEnum([Replayability.LOW, Replayability.MEDIUM, Replayability.HIGH],{
        message:'Valid replayability value Requiered'
    })
    replayability: Replayability;

    @IsString()
    @IsOptional()
    howToPlayUrl: string;

    @IsObject()
    @IsOptional()
    reel: Reel;

    @IsString()
    @IsOptional()
    @IsEnum([Section.BOARDGAMES],{
        message:'Valid Section value Requiered'
    })
    section:Section

    @IsString()
    @IsOptional()
    cardCoverImgName:string;

    @IsArray()
    @IsOptional()
    imgName:string[];

    @IsString()
    @IsOptional()
    itemName: string; //Is the title without spaces
    
    @IsBoolean()
    @IsOptional()
    publish:Boolean;

}


