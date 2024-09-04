import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Section } from "src/helpers/section.enum";


export class UploadImgDto {

    @IsString()
    @IsNotEmpty()
    @IsEnum([Section.BOARDGAMES],{
        message:'Valid Section value Requiered'
    })
    section:Section
   
}
