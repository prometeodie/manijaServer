import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";


export class CreateBlogsManijaDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    subTitle: string;

    @IsString()
    @IsNotEmpty()
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
    section: string; // juegos, blogs, eventos

    @IsString()
    @IsOptional()
    itemName: string; // if:juegos / zombiecide, brass, kinmo...
    // if:blog / blog1, blog2, ...
    // if:evento / event1, event2, .
}
