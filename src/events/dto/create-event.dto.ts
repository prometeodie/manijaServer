import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import {  Section } from "src/helpers/section.enum";

export class CreateEventDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    title: string;
    
    @IsDateString()
    @IsOptional()
    eventDate: Date | null;

    @IsString()
    @IsOptional()
    @IsOptional()
    alternativeTxtEventDate: string | null;
    
    @IsString()
    @IsOptional()
    startTime: string;

    @IsString()
    @IsOptional()
    finishTime: string;
    
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
    @IsOptional()
    url : string;

    @IsString()
    @IsNotEmpty()
    @IsEnum([Section.EVENTS],{
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
