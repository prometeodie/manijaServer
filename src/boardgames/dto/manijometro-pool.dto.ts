import { IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import { ManijometroValues } from "../utils/manijometro-interfaces";
import { StringToNumberTransformer } from "../utils/tranformToNumber";
import { Transform } from "class-transformer";

export class ManijometroPoolDto {

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsObject()
    @IsNotEmpty()
    manijometroValuesPool: ManijometroValues;

    @IsNumber()
    @IsNotEmpty()
    @Transform(value => new StringToNumberTransformer().to(value))
    totalManijometroUserValue: number;
}
