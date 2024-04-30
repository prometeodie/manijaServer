import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Section } from "src/helpers/section.enum";


export class CreateAboutDto {
    @IsString()
    @IsNotEmpty()
    text:string;
    
    @IsString()
    @IsOptional()
    imgName: string;

    @IsBoolean()
    @IsOptional()
    publish: boolean;
    
    @IsString()
    @IsNotEmpty()
    @IsEnum(['ABOUT'],{
        message:'Valid Section value Requiered'
    })
    section:Section

}
