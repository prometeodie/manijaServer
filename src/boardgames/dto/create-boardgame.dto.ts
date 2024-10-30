import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';

import { Section } from "src/helpers/section.enum";
import { CategoryGame } from "../utils/boardgames-categories.enum";
import { Dificulty } from "../utils/dificulty.enum";
import { Replayability } from "../utils/Replayability.enum";

import { StringToNumberTransformer } from "../utils/tranformToNumber";
import { Transform } from "class-transformer"; 
import { Reel } from '../utils/reel.class';



export class CreateBoardgameDto {
    
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    @IsEnum(CategoryGame, { each: true, message:'valid category value is requiered'})
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
    minAge: number;

    @IsNumber()
    @IsOptional()
    @Transform(value => new StringToNumberTransformer().to(value))
    duration: number;

    @IsString()
    @IsOptional()
    gameReview: string;

    @IsString()
    @IsOptional()
    @IsEnum(Dificulty,{ each:true, message:'Valid dificulty value Requiered'})
    dificulty: Dificulty;

    @IsString()
    @IsOptional()
    @IsEnum(Replayability,{ each:true, message:'Valid replayability value Requiered' })
    replayability: Replayability;

    @IsString()
    @IsOptional()
    howToPlayUrl: string;

    @IsArray()
    @IsOptional()
    reel: Reel[];

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


