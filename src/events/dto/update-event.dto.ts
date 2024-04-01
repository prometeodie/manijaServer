import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { Section } from 'src/helpers/section.enum';

export class UpdateEventDto extends PartialType(CreateEventDto) {

    
    @IsString()
    @IsOptional()
    @MaxLength(35)
    title: string;
    
    @IsDateString()
    @IsOptional()
    eventDate: Date;
    
    @IsString()
    @IsOptional()
    schedule: string;
    
    @IsString()
    @IsOptional()
    eventPlace: string;
    
    @IsString()
    @IsOptional()
    eventColor: string;
    
    @IsString()
    @IsOptional()
    imgName: string;
    
    @IsString()
    @IsOptional()
    url : string;
    
    @IsString()
    @IsOptional()
    category: string;

    @IsString()
    @IsOptional()
    itemName: string;

    @IsString()
    @IsOptional()
    section: Section;
    
    @IsBoolean()
    @IsOptional()
    publish: boolean;
    
    @IsBoolean()
    @IsOptional()
    mustBeAutomaticallyDeleted: boolean;
}
