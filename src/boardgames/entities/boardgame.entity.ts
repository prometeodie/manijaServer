import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { Reel } from "../utils/reel.class";
import { CategoryGame } from "../utils/boardgames-categories.enum";
import { Section } from "src/helpers/section.enum";
import { Replayability } from "../utils/Replayability.enum";
import { Dificulty } from "../utils/dificulty.enum";
import { ManijometroPoolEntity } from "../utils/manijometro-interfaces";


@Schema()
export class Boardgame {

    @Prop({required: true})
    title: string;

    @Prop({required: true})
    categoryGame: CategoryGame;

    @Prop({required: false})
    categoryChips: string[];

    @Prop({required: false})
    minPlayers: number;
    
    @Prop({required: false})
    maxPlayers: number;

    @Prop({required: false})
    minAge: number;

    @Prop({required: false})
    duration: number;
    
    @Prop({required: false})
    manijometroPool: ManijometroPoolEntity[];

    @Prop({required: false, default: 0})
    manijometro: number;

    @Prop({required: false})
    manijometroPosition: number;

    @Prop({required: false})
    gameReview: string;

    @Prop({required: false})
    dificulty: Dificulty;

    @Prop({required: false})
    replayability: Replayability;

    @Prop({required: false})
    howToPlayUrl: string;

    @Prop({required: false})
    reel: Reel[];

    @Prop({required:true})
    section:Section

    @Prop({required: false})
    cardCoverImgName:string;

    @Prop({required: false})
    imgName:string[];

    @Prop({required: true})
    creationDate:Date;
    
    @Prop({required: true})
    publish:Boolean;
}
export const BoardgameSchema = SchemaFactory.createForClass(Boardgame);
export const BoardgameBackUpSchema = SchemaFactory.createForClass(Boardgame);





















