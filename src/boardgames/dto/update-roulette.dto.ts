import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdateRouletteDto{

    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsBoolean()
    @IsNotEmpty()
    roulette: Boolean;
}
