import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogsManijaDto } from './create-blogs-manija.dto';
import { IsNotEmpty, IsOptional, IsString, MinLength, isString } from 'class-validator';

export class UpdateBlogsManijaDto extends PartialType(CreateBlogsManijaDto) {

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    title: string;
    
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    subTitle: string;
    
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    writedBy:string;
    
    @IsString()
    @MinLength(20)
    @IsOptional()
    blogContent:string;
    
    @IsString()
    @IsOptional()
    category:string[]
    
    @IsString()
    @IsOptional()
    imgUrl:string;

    @IsString()
    @IsOptional()
    section: string; // juegos, blogs, eventos

    @IsString()
    @IsOptional()
    itemName: string; // if:juegos / zombiecide, brass, kinmo...
    // if:blog / blog1, blog2, ...
    // if:evento / event1, event2, .
}
