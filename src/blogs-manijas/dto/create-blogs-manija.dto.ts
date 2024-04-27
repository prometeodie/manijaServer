import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Section } from "src/helpers/section.enum";


export class CreateBlogsManijaDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    subTitle: string;

    @IsString()
    @IsOptional()
    writedBy: string;

    @IsArray()
    @IsNotEmpty()
    category:string[]
    
    @IsString()
    @MinLength(20)
    blogContent: string;

    @IsArray()
    @IsOptional()
    imgName: string[];

    @IsString()
    @IsNotEmpty()
    @IsEnum([Section.BLOGS],{
        message:'Valid Section value Requiered'
    })
    section:Section

    @IsString()
    @IsNotEmpty()
    itemName: string; //Is the title without spaces

    @IsBoolean()
    @IsOptional()
    publish:Boolean
}
