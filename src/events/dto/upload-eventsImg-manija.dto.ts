import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Section } from "src/helpers/section.enum";


export class UploadImgDto {

    @IsString()
    @IsNotEmpty()
    @IsEnum([Section.EVENTS],{
        message:'Valid Section value Requiered'
    })
    section:Section

    @IsString()
    @IsNotEmpty()
    itemName: string; //Is the title without spaces
   
}