import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsBoolean, IsDate, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {

    
    @IsString()
    @IsOptional()
    @MaxLength(35)
    title: string;
    
    @IsDateString()
    @IsOptional()
    eventDate: string;
    
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
    category: string;

    @IsString()
    @IsOptional()
    itemName: string;

    @IsString()
    @IsOptional()
    section: string;
    
    @IsBoolean()
    @IsOptional()
    publish: boolean;
    
    @IsBoolean()
    @IsOptional()
    mustBeAutomaticallyDeleted: boolean;
}
