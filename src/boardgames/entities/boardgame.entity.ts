import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { Reel } from "../utils/reel.class";
import { CategoryGame } from "../utils/game.enum";
import { Section } from "src/helpers/section.enum";
import { Replayability } from "../utils/Replayability.enum";
import { Dificulty } from "../utils/dificulty.enum";

@Schema()
export class Boardgame {

    @Prop({required: true})
    title: string;

    @Prop({required: true})
    categoryGame: CategoryGame;

    @Prop({required: true})
    categoryChips: string[];

    @Prop({required: true})
    minPlayers: number;

    @Prop({required: true})
    maxPlayers: number;

    @Prop({required: true})
    duration: number;

    @Prop({required: true})
    manijometro: number;

    @Prop({required: false})
    manijometroPosition: number;

    @Prop({required: true})
    gameReview: string;

    @Prop({required: true})
    dificulty: Dificulty;

    @Prop({required: true})
    replayability: Replayability;

    @Prop({required: true})
    howToPlayUrl: string;

    @Prop({required: true})
    reel: Reel;

    @Prop({required:true})
    section:Section

    @Prop({required: true})
    cardCoverImgName:string;

    @Prop({required: true})
    imgName:string[];

    @Prop({required: true})
    creationDate:Date;
    
    @Prop({required: true})
    publish:Boolean;
}
export const BoardgameSchema = SchemaFactory.createForClass(Boardgame);
export const BoardgameBackUpSchema = SchemaFactory.createForClass(Boardgame);





















