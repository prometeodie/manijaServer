import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogsManijaDto } from './create-blogs-manija.dto';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Section } from 'src/helpers/section.enum';

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
    
    @IsArray()
    @IsOptional()
    category:string[]
    // TODO:agregar un enum con categorias cuando sepa cules son
    
    @IsArray()
    @IsOptional()
    imgName: string[];

    @IsString()
    @IsOptional()
    @IsEnum([Section.BLOGS],{
        message:'Valid Section value Requiered'
    })
    section:Section
    
    @IsBoolean()
    @IsOptional()
    publish:Boolean
}
