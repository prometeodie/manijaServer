import { PartialType } from '@nestjs/mapped-types';
import { CreateAboutDto } from './create-about.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAboutDto extends PartialType(CreateAboutDto) {
    @IsString()
    @IsOptional()
    text:string;
    
    @IsString()
    @IsOptional()
    subject:string; 
    
    @IsString()
    @IsOptional()
    imgName: string;
    
}
