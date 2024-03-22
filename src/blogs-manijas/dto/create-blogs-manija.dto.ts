import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
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

    @IsString()
    @IsNotEmpty()
    category:string[]
    
    @IsString()
    @MinLength(20)
    blogContent: string;

    @IsString()
    @IsOptional()
    imgName: string[];

    @IsString()
    @IsOptional()
    section: Section; // juegos, blogs, eventos

    @IsString()
    @IsOptional()
    itemName: string; // zombiecide, brass, kinmo...

    @IsBoolean()
    @IsOptional()
    publish:Boolean
}
