import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Section } from "src/helpers/section.enum";
import { BlogsCategories } from "../utils/blogs-categories.enum";


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

    @IsNotEmpty()
    @IsEnum(BlogsCategories,{ each:true, message:'Valid category value Requiered'})
    category:BlogsCategories
    
    @IsString()
    blogContent: string;

    @IsString()
    @IsOptional()
    imgName: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum([Section.BLOGS],{
        message:'Valid Section value Requiered'
    })
    section:Section

    @IsBoolean()
    @IsOptional()
    publish:Boolean
}
