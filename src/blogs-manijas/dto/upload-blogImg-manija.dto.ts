import { IsNotEmpty, IsString } from "class-validator";

export class UploadImgKeyDto {

    @IsString()
    @IsNotEmpty()
    key:string
   
}