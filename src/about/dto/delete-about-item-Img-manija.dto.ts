import { IsNotEmpty, IsString } from "class-validator";

export class DeleteAboutItemImgKeyDto {

    @IsString()
    @IsNotEmpty()
    key:string
   
}