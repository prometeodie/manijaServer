import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogsManijaDto } from './create-blogs-manija.dto';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateBlogsManijaDto extends PartialType(CreateBlogsManijaDto) {

    @IsString()
    @IsOptional()
    title: string;
    
    @IsString()
    @IsOptional()
    subTitle: string;
    
    @IsString()
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
    imgName: string[];

    @IsString()
    @IsOptional()
    section: string;

    @IsString()
    @IsOptional()
    itemName: string; 
    
    @IsBoolean()
    @IsOptional()
    publish:Boolean
}
