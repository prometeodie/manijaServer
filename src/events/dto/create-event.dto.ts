import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateEventDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(35)
    title: string;
    
    @IsDateString()
    @IsNotEmpty()
    eventDate: string;
    
    @IsString()
    @IsNotEmpty()
    schedule: string;
    
    @IsString()
    @IsNotEmpty()
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
