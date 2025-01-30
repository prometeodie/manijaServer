import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CommunityRatingDto{

    @IsString()
    @IsOptional()
    voteId: string;
    
    @IsNumber()
    @IsNotEmpty()
    userScore :number;
}
