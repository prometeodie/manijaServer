import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdateRoulette{

    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsBoolean()
    @IsNotEmpty()
    roulette: Boolean;
}
