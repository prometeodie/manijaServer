import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Section } from "src/helpers/section.enum";


export class CreateContactDto {
    @IsString()
    @IsNotEmpty()
    fullName:string;
    
    @IsEmail()
    @IsNotEmpty()
    email:string; 
    
    @IsString()
    @IsNotEmpty()
    subject:string; 
    
    @IsString()
    @IsNotEmpty()
    message:string; 
    
    @IsString()
    @IsNotEmpty()
    section:Section; 
}
