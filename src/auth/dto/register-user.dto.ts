import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';



export class RegisterUserDto {

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(8)
    @IsStrongPassword()
    password: string;


}
