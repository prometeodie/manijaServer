import { IsNotEmpty, IsString } from "class-validator";

export class DeleteBoardGameImgKeyDto {

    @IsString()
    @IsNotEmpty()
    key:string
   
}