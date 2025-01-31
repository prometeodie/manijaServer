import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CommunityRatingDto{

    @IsString()
    @IsOptional()
    voteId: string;
    
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    userScore :number;
}
