import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import {  Section } from "src/helpers/section.enum";

export class CreateEventDto {

    @IsString()
    @IsNotEmpty()
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
    @IsNotEmpty()
    eventColor: string;
    
    @IsString()
    @IsOptional()
    imgName: string;
    
    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    itemName: string;
    
    @IsString()
    @IsOptional()
    url : string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['EVENTS'],{
        message:'Valid Section value Requiered'
    })
    section:Section
    
    @IsBoolean()
    @IsOptional()
    publish: boolean;
    
    @IsBoolean()
    @IsNotEmpty()
    mustBeAutomaticallyDeleted: boolean;
}
