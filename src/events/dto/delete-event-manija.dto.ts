import { IsNotEmpty, IsString } from "class-validator";

export class DeleteImgKeyDto {

    @IsString()
    @IsNotEmpty()
    key:string
   
}