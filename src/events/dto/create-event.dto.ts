import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateEventDto {

    @IsString()
    @IsNotEmpty()
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
    section: string;
    
    @IsBoolean()
    @IsOptional()
    publish: boolean;
    
    @IsBoolean()
    @IsOptional()
    mustBeAutomaticallyDeleted: boolean;
}
